# Quick guide

This section is a quick guide to installing all the dependencies.
The given instructions are only for Debian-based systems.
*Although we provided the collection of all the needed commands, we do not guarantee correctness.
Therefore, consult the official websites if you need help with problems.*

## System

First, we can install basic packages via the native package manager `apt`.
The tools `docker` and `kubectl` need these packages to function correctly.

```bash
sudo apt -y update
sudo apt -y install ca-certificates curl gnupg lsb-release
```

## Docker

Docker will manage the containers of the deployed cluster.
The [docker documentation](https://docs.docker.com/engine/install/ubuntu/) recommends removing any existing docker installation to have the correct version.

```bash
sudo apt remove docker docker-engine docker.io containerd runc
```

The next step is to add the docker signing key to the package manager and make the native package manager aware of the docker repository.

```bash
mkdir -p /etc/apt/keyrings
curl -fsSL "https://download.docker.com/linux/ubuntu/gpg" |
    sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] "https://download.docker.com/linux/ubuntu" \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list >/dev/null
```

Finally, the documentation explained that we must change the installation pattern if we do not want the latest version.
So feel free to adapt this section to your needs.

```bash
sudo apt -y update

VERSION_STRING=5:20.10.23~3-0~ubuntu-jammy
VERSION_AVAILABLE=$(apt-cache madison docker-ce | awk '{ print $3 }')

if echo $VERSION_AVAILABLE | grep -q "$VERSION_STRING"; then 
    sudo apt -y install \
        docker-ce=$VERSION_STRING \
        docker-ce-cli=$VERSION_STRING \
        containerd.io \
            docker-compose-plugin; 
else
    echo "Could not find $VERSION_STRING."
fi
```

Post-installation, depending on the system, it might be necessary to add the current user to a `docker` group which will grant access to the docker socket.

```bash
sudo groupadd docker
sudo usermod -aG docker $USER
newgrp docker
```

## Kubectl

To work with any cluster, we must install the Kubernetes command-line tool `kubectl`.
The easiest method is to curl the binary, as it can ensure the same version.

```bash
VERSION=v1.26.1

curl -LO "https://dl.k8s.io/release/$VERSION/bin/linux/amd64/kubectl"
curl -LO "https://dl.k8s.io/$VERSION/bin/linux/amd64/kubectl.sha256"
```

Verify the downloaded executable `kubectl`.

```bash
echo "$(cat kubectl.sha256) kubectl" | sha256sum --check
```

Now, we can use the `install` command to add the `kubectl` executable to the local binaries path.

```bash
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
```

## Kind

Next, we need an environment to create a cluster.
Note that you can use cloud services instead.
The `kind` tool (Kubernetes in Docker) allows us to create a local cluster.
Alternatives are `k3d` or `minikube`, but during testing `kind` delivered the most reliable results.

Similar to the `kubectl` executable, we will curl the `kind` binary.

```bash
VERSION=v0.17.0
FILE=kind-linux-amd64

curl -Lo ./$FILE "https://github.com/kubernetes-sigs/kind/releases/download/$VERSION/$FILE"
curl -Lo ./$FILE.sha256 "https://github.com/kubernetes-sigs/kind/releases/download/$VERSION/$FILE.sha256sum"
```

Verify the downloaded executable `kind`.

```bash
echo "$(cat $FILE.sha256)" | sha256sum --check
```

Now, we can use the `install` command to add the `kubectl` executable to the local binaries path.

```bash
sudo install -o root -g root -m 0755 $FILE /usr/local/bin/kind
```

## k9s

As previously mentioned, this part is optional.
The `k9s` command line interface provides comfortable tooling with an excellent cluster overview.
Nonetheless, working solely with `kubectl` is sufficient.
Download the binary and unpack it.

```bash
FILE=k9s_Linux_amd64.tar.gz
curl -LO "https://github.com/derailed/k9s/releases/download/v0.27.0/$FILE"
tar -xzf $FILE
```

Finally, install it.

```bash
sudo install -o root -g root -m 0755 ./k9s /usr/local/bin/k9s
```
