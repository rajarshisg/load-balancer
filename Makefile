IMAGE_NAME = load-balancer
DOCKER_FILE_PATH = .
CONTAINER_NAME = load-balancer-container
HOST_PORT=3000
CONTAINER_PORT=3000

.DEFAULT_GOAL = run

# Target to build the docker image
build:
	@echo "Building the Docker image..."
	docker build -t $(IMAGE_NAME) $(DOCKER_FILE_PATH)

# Target to run the container, it builds the image if not already built
run: build
	@echo "Running the Docker container..."
	docker run -p $(HOST_PORT):$(CONTAINER_PORT) --name $(CONTAINER_NAME) $(IMAGE_NAME)

# Target to stop the docker container
stop:
	@echo "Stoping the Docker container..."
	docker stop $(CONTAINER_NAME) || true
	docker rm $(CONTAINER_NAME) || true

# Clean up: remove the image and container
clean: stop
	@echo "Cleaning up Docker image..."
	docker rmi $(IMAGE_NAME) || true

# Rebuild: force rebuild the image
rebuild: clean build