---
title: Kubernetes Deployment
description: Deploy Cadence to Kubernetes with Helm
---

# Kubernetes Deployment

Complete guide to deploying Cadence on Kubernetes for production workloads.

## Prerequisites

- Kubernetes cluster (1.24+)
- `kubectl` configured
- Helm 3.x (optional but recommended)
- Persistent volume provisioner (for state)
- Ingress controller (nginx or similar)

## Quick Start

### 1. Create Namespace

```bash
kubectl create namespace cadence
kubectl config set-context --current --namespace=cadence
```

### 2. Create ConfigMap

```bash
kubectl create configmap cadence-config \
  --from-literal=CADENCE_AI_PROVIDER=anthropic \
  --from-literal=CADENCE_AI_BASE_URL=https://api.anthropic.com/v1 \
  --from-literal=CADENCE_LOG_LEVEL=info \
  --namespace=cadence
```

### 3. Create Secret

```bash
kubectl create secret generic cadence-secrets \
  --from-literal=ANTHROPIC_API_KEY=sk-ant-xxx \
  --from-literal=WEBHOOK_SECRET=your-webhook-secret-here \
  --namespace=cadence
```

### 4. Deploy with kubectl

Create `cadence-deployment.yaml`:

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: cadence-cache
  namespace: cadence
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: standard
  resources:
    requests:
      storage: 10Gi
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: cadence-webhook
  namespace: cadence
  labels:
    app: cadence
    component: webhook
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: cadence
      component: webhook
  template:
    metadata:
      labels:
        app: cadence
        component: webhook
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "8000"
        prometheus.io/path: "/metrics"
    spec:
      serviceAccountName: cadence
      securityContext:
        runAsNonRoot: true
        runAsUser: 1000
        fsGroup: 1000
      containers:
      - name: webhook
        image: cadence:0.3.0
        imagePullPolicy: IfNotPresent
        command: ["./cadence", "webhook"]
        ports:
        - name: http
          containerPort: 8000
          protocol: TCP
        env:
        - name: CADENCE_AI_KEY
          valueFrom:
            secretKeyRef:
              name: cadence-secrets
              key: ANTHROPIC_API_KEY
        - name: WEBHOOK_SECRET
          valueFrom:
            secretKeyRef:
              name: cadence-secrets
              key: WEBHOOK_SECRET
        - name: LOG_LEVEL
          valueFrom:
            configMapKeyRef:
              name: cadence-config
              key: CADENCE_LOG_LEVEL
        - name: AI_PROVIDER
          valueFrom:
            configMapKeyRef:
              name: cadence-config
              key: CADENCE_AI_PROVIDER
        - name: CADENCE_AI_BASE_URL
          valueFrom:
            configMapKeyRef:
              name: cadence-config
              key: CADENCE_AI_BASE_URL
        - name: MAX_WORKERS
          value: "8"
        - name: PORT
          value: "8000"
        resources:
          requests:
            cpu: 250m
            memory: 512Mi
          limits:
            cpu: 1000m
            memory: 2Gi
        livenessProbe:
          httpGet:
            path: /health
            port: http
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: /health
            port: http
          initialDelaySeconds: 10
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 3
        volumeMounts:
        - name: cache
          mountPath: /var/cache/cadence
      volumes:
      - name: cache
        persistentVolumeClaim:
          claimName: cadence-cache
      affinity:
        podAntiAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
          - weight: 100
            podAffinityTerm:
              labelSelector:
                matchExpressions:
                - key: app
                  operator: In
                  values:
                  - cadence
              topologyKey: kubernetes.io/hostname
---
apiVersion: v1
kind: Service
metadata:
  name: cadence-webhook
  namespace: cadence
  labels:
    app: cadence
spec:
  type: ClusterIP
  selector:
    app: cadence
    component: webhook
  ports:
  - name: http
    port: 80
    targetPort: 8000
    protocol: TCP
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: cadence-webhook
  namespace: cadence
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: cadence-webhook
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

Deploy:

```bash
kubectl apply -f cadence-deployment.yaml
```

Verify:

```bash
kubectl get pods -n cadence
kubectl get svc -n cadence
```

## Next Steps

- [Nginx Setup](/docs/reference/operations/networking/nginx) - Ingress controller
- [Monitoring](/docs/reference/operations/monitoring) - Prometheus metrics
- [High Availability](/docs/reference/operations/ha) - Multi-region setup
