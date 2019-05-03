docker-compose -f docker-compose.yml down

docker stop $(docker ps -aq)
docker rm $(docker ps -aq)

#remove docker volume
docker volume rm $(docker volume ls | awk '{print $2}')

docker ps -a


