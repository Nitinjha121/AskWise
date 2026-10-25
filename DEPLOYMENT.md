# Deploying AskWise on AWS

I haven't deployed this. This is how I would do it on AWS with containers.

## The setup

The backend already has a Dockerfile, so I'd run it on ECS with Fargate. Fargate runs containers without me having to manage EC2 instances, and for a single small API it's a lot less work than Kubernetes (EKS).

The frontend is just static files after `npm run build`, so it doesn't need a container. I'd put them in an S3 bucket and serve them through CloudFront.

CloudFront would sit in front of both. Requests to `/api/*` go to an Application Load Balancer, which forwards them to the ECS tasks. Everything else is served from S3. Because the browser only ever talks to one domain, the app works the same way it does locally with the Vite proxy, and I still don't need CORS.

```
Browser ──► CloudFront ──► /api/*  ──► Load Balancer ──► ECS Fargate (backend containers)
                       └─► other   ──► S3 (React build)
```

The ECS tasks would run in private subnets, so only the load balancer can reach them. They'd call the Gemini API through a NAT gateway.

## Steps

1. Build the backend image and push it to Amazon ECR, tagged with the git commit hash so every deploy points at an exact version.
2. Store `JWT_SECRET` and `GEMINI_API_KEY` in AWS Secrets Manager. The ECS task definition references them, and ECS passes them to the container as environment variables when it starts. They never go into the image or the repository. The `.dockerignore` already keeps `.env` out of the image.
3. Create the ECS task definition: the image from ECR, port 3000, the two secrets, and `NODE_ENV=production`. Setting `NODE_ENV` also switches off the test-token endpoint. A quarter of a vCPU and 512 MB of memory is enough to start with.
4. Create an ECS service that keeps at least two tasks running in two availability zones, attached to the load balancer. The load balancer's health check would call `GET /api/health`, and ECS replaces any task that stops responding.
5. Build the frontend, upload `dist/` to S3, and invalidate the CloudFront cache.
6. Automate the above with GitHub Actions. On every merge to main it would install, type-check, build the image, push it to ECR and update the ECS service. ECS does a rolling deployment, so the old tasks keep serving until the new ones are healthy, and with the deployment circuit breaker turned on it rolls back automatically if they never become healthy. GitHub would log in to AWS through OIDC, so no AWS access keys are stored in GitHub.
