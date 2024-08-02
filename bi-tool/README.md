# AQP-enabled Visual Data Analysis Support Tool Suite

## Requirements

### Install Docker

```console
sudo apt update 
sudo apt install docker-ce
```

```console
sudo service docker start
```

### Install redash

```console
sudo docker pull jrei/systemd-ubuntu:18.04 
sudo docker run -d -p 5555:5000 --name traindb_workbench --privileged -v /sys/fs/cgroup:/sys/fs/cgroup:ro jrei/systemd-ubuntu:18.04 
```

```console
sudo docker exec -itu 0 traindb_workbench bash 
apt update && apt install sudo git vim docker-compose -y 
cd && git clone https://github.com/getredash/setup
cd setup && export USER=root && chmod +x setup.sh && ./setup.sh 
```

## Build 

```console
cd && git clone https://github.com/traindb-project/aqp-tav.git 
cp aqp-tav/bi-tool/docker-compose-opt.yml /opt/redash/docker-compose.yml
cp -rf aqp-tav/bi-tool /app
```

TrainDB connection properties need to be set in ``/app/redash/models/train_model.py``. (temporarily for current implementation)

```console
service docker start
cd /app && docker-compose build
```

## Run

```console
cd /opt/redash && docker-compose up -d
```

### Create database
You have to create databases once on first run.
```console
cd /app && cat create_workbench_db.sql | docker exec -i $(docker ps | grep postgres | awk '{print $1}') psql -U postgres --password
```

