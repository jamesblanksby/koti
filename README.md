Koti
====

## Installation

1. Change working directory
```bash
$ cd /volume1/Docker/koti
```

2. Build and run docker container
```bash
$ docker build -t koti . && docker run -dit --name koti -p 8000:80 --restart always koti
```
