@echo off
echo Pulling the latest Docker image...
docker pull hjain2003/rapidfortserver:latest

echo Stopping and removing any existing container...
docker stop rapidfortserver || echo No container to stop.
docker rm rapidfortserver || echo No container to remove.

echo Running the Docker container...
docker run -d -p 5000:5000 --name rapidfortserver hjain2003/rapidfortserver:latest

echo Container is now running on port 5000.
pause
