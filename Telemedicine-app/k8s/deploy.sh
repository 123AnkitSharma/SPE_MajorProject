#!/bin/bash

# Apply namespace
kubectl apply -f namespace.yaml --validate=false
kubectl apply -f elk-namespace.yaml --validate=false

# Apply main application resources
kubectl apply -f mongodb/ --validate=false
kubectl apply -f backend/ --validate=false
kubectl apply -f frontend/ --validate=false
kubectl apply -f ingress.yaml --validate=false

# Apply ELK stack resources
echo "Deploying ELK stack..."
kubectl apply -f elasticsearch.yaml --validate=false
kubectl apply -f logstash.yaml --validate=false
kubectl apply -f kibana.yaml --validate=false
kubectl apply -f filebeat.yaml --validate=false
kubectl apply -f metricbeat.yaml --validate=false

# Wait for deployments to be ready
echo "Waiting for MongoDB deployment..."
kubectl rollout status statefulset/mongodb -n telehealth

echo "Waiting for backend deployment..."
kubectl rollout status deployment/backend -n telehealth

echo "Waiting for frontend deployment..."
kubectl rollout status deployment/frontend -n telehealth

echo "Waiting for ELK stack deployments..."
kubectl rollout status deployment/elasticsearch -n elk-monitoring
kubectl rollout status deployment/logstash -n elk-monitoring
kubectl rollout status deployment/kibana -n elk-monitoring

echo "Deployment complete!"
echo "To access the application, add 'telemedicine.local' to your /etc/hosts file"
echo "To access Kibana dashboard, you can port-forward: kubectl port-forward svc/kibana 5601:5601 -n elk-monitoring"