# Quick guide

This is a quick guide to install all the dependencies.
We only give the instructions for Ubuntu-based systems.
*Of course, we recommend to check the official websites.*

## System

To make all the installations, we will need some other dependencies.
Most can be installed via the native package manager.

```bash
sudo apt -y update
sudo apt -y install ca-certificates curl gnupg lsb-release
```

## Docker

The [docker documentation](https://docs.docker.com/engine/install/ubuntu/) recommends to remove any existing docker installation.

```bash
apt remove docker docker-engine docker.io containerd runc
```

The next step does get the dockers signing key and add dockers repository to the native package manager.

```bash
mkdir -p /etc/apt/keyrings
curl -fsSL "https://download.docker.com/linux/ubuntu/gpg" |
    sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] "https://download.docker.com/linux/ubuntu" \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list >/dev/null
```

Finally, docker explained that we have to change the installation pattern, if we do not want the latest version. Feel free adapting this section to your needs.

```bash
VERSION_STRING=5:20.10.23~3-0~ubuntu-jammy
VERSION_AVAILABLE=$(apt-cache madison docker-ce | awk '{ print $3 }')

if echo $VERSION_AVAILABLE | grep -q "$VERSION_STRING"; then 
    sudo apt -y update
    sudo apt -y install \
        docker-ce=$VERSION_STRING \
        docker-ce-cli=$VERSION_STRING \
        containerd.io \
            docker-compose-plugin; 
fi
```

Depending on the system, it might be necessary to add the current user to a special group which grants access to the docker socket.

```bash
sudo groupadd docker
sudo usermod -aG docker $USER
newgrp docker
```

## Kubectl

For `kubectl`, we recommend to follow the installation via `curl` because it is easier to ensure the same version.

```bash
VERSION=v1.26.1

curl -LO "https://dl.k8s.io/release/$VERSION/bin/linux/amd64/kubectl"
curl -LO "https://dl.k8s.io/$VERSION/bin/linux/amd64/kubectl.sha256"
```

Verify the downloaded `kubectl` executable.

```bash
echo "$(cat kubectl.sha256) kubectl" | sha256sum --check
```

Now, we can use the `install` command to add the `kubectl` executable to the local binaries path.

```bash
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
```

## Kind

The `kind` tool allows us to create a local cluster.
There are other options available, like `k3d` or `minikube`.
However, during testing we have found that `kind` worked best with the Istio preview version.
Further, Istio used it for their demo.

Similar to the `kubectl` executable, we will curl the binary of the `kind` tool.

```bash
VERSION=v0.17.0
FILE=kind-linux-amd64

curl -Lo ./$FILE "https://github.com/kubernetes-sigs/kind/releases/download/$VERSION/$FILE"
curl -Lo ./$FILE.sha256 "https://github.com/kubernetes-sigs/kind/releases/download/$VERSION/$FILE.sha256sum"
```

Verify the downloaded `kind` executable.

```bash
echo "$(cat $FILE.sha256)" | sha256sum --check
```

Now, we can use the `install` command to add the `kubectl` executable to the local binaries path.

```bash
sudo install -o root -g root -m 0755 $FILE /usr/local/bin/kind
```

## k9s

As previously mentioned, this part is optional.
The `k9s` command line interface provides comfortable tooling with a great overview of a cluster.
Nonetheless, working solely with `kubectl` is sufficient.
Download the binary and unpack it.

```bash
FILE=k9s_Linux_arm64.tar.gz
curl -LO "https://github.com/derailed/k9s/releases/download/v0.27.0/$FILE"
tar -xzf $FILE
```

Finally, install it.

```bash
sudo install -o root -g root -m 0755 ./k9s /usr/local/bin/k9s
```
