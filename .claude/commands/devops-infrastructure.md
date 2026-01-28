# DevOps Infrastructure Development

DevOps infrastructure development workflow with Product Manager → DevOps Engineer → Documentation Engineer.

## Task

I'll launch the `devops-workflow-orchestrator` agent to coordinate infrastructure development for: $ARGUMENTS

## Process

I'll use the Task tool to launch the orchestrator agent with the infrastructure request, which will:

1. **Requirements Analysis** - Launch Product Manager agent to create task breakdown
2. **Infrastructure Implementation** - Launch DevOps Engineer to build containers, CI/CD, infrastructure
3. **Documentation** - Launch DevOps Documentation Engineer to create runbooks, ops guides, and infrastructure docs
4. **Final Report** - Summarize completion and artifacts created

The orchestrator agent will handle all coordination automatically.

## Usage Examples

```bash
# Docker containerization
/devops-infrastructure "Dockerize Node.js application with multi-stage builds and docker-compose for local development"

# CI/CD pipeline
/devops-infrastructure "Create GitHub Actions CI/CD pipeline with automated testing, security scanning, and deployment to AWS"

# Kubernetes deployment
/devops-infrastructure "Set up Kubernetes deployment with HPA, monitoring, and blue-green deployment strategy"

# Infrastructure as Code
/devops-infrastructure "Create Terraform configuration for AWS infrastructure with VPC, ECS, RDS, and CloudFront"

# Monitoring and observability
/devops-infrastructure "Implement comprehensive monitoring with Prometheus, Grafana, and alert rules for production"

# Database containerization
/devops-infrastructure "Create production-ready PostgreSQL Docker setup with replication, backups, and monitoring"
```

## Expected Deliverables

After completion, you'll have:

- ✅ Task breakdown in `.claude/tasks/<feature>/`
- ✅ Complete infrastructure configuration (Dockerfiles, docker-compose, K8s manifests, etc.)
- ✅ CI/CD pipeline configured
- ✅ Deployment scripts
- ✅ Comprehensive documentation:
  - Infrastructure documentation with architecture diagrams
  - Runbooks for deployment, rollback, incident response
  - Operations guides for daily tasks and maintenance
  - Developer setup guides
  - Reference documentation for all configs and commands
- ✅ Production-ready infrastructure

## Notes

- Orchestrator coordinates Product Manager → DevOps Engineer → Documentation Engineer
- 3-phase workflow with complete documentation
- Task files created for tracking
- Infrastructure ready for deployment with ops team documentation
