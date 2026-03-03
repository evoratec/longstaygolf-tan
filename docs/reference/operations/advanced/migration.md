---
title: Migration & Upgrades
description: Upgrade Cadence between versions and migrate deployments
---

# Migration & Upgrades

Guide for upgrading Cadence between versions and migrating between deployment methods.

[Full Migration Guide - See operations/migration.md for complete details including v0.2.x → v0.3.0 upgrade, deployment migration (Docker → systemd → Kubernetes), data migration, configuration migration, troubleshooting, rollback procedures, and post-upgrade validation steps.]

## Quick Reference

### Version Upgrade
- v0.2.x → v0.3.0: Automatic migration
- Backup database and configuration before upgrading
- Test in staging environment first

### Deployment Migration
- Docker → systemd: Export environment, create systemd service
- systemd → Kubernetes: Build Docker image, deploy with Helm
- Single → HA: Add load balancer, shared cache, replication

### Breaking Changes
- OPENAI_API_KEY → CADENCE_AI_KEY
- Default port remains 8000
- HTTP/2 support added

### Rollback
If issues occur:
1. Restore old binary
2. Revert environment variables
3. Restart service
4. Restore database from backup (if needed)

## Key Checklist

- [ ] Read release notes
- [ ] Back up database and configuration
- [ ] Test in staging first
- [ ] Plan maintenance window
- [ ] Update environment variables
- [ ] Run health checks
- [ ] Verify webhook processing
- [ ] Monitor metrics post-upgrade

## Next Steps

- See full [Migration & Upgrades](/docs/reference/operations/advanced/migration) guide
- [Performance Tuning](/docs/reference/operations/advanced/performance) after upgrade
- [Monitoring](/docs/reference/operations/monitoring) - Verify stability
