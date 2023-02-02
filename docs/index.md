# Welcome

This repository gives more context regarding the setup of Istio's ambient and traditional service mesh experiment.
It uses the `book info` example to demonstrate the performance difference between the two service meshes.
Further, it is essential to note that this is an academic example and that real environment benchmarks are necessary to understand proper behaviour.
Nonetheless, the benchmark aims to show the new approach's tendencies and opportunities.

## Requirements

You are required to install the listed software below to run the benchmarks.
See the section `Prerequisites` for more information.
Feel free to skip if you have the required software installed.

- [Docker Version 20.10.23](https://docs.docker.com/engine/install/)
- [Kubernetes CLI Version 1.26.1](https://kubernetes.io/docs/tasks/tools/)
- [Go Version 1.19.5](https://go.dev/dl/)
- [kind Version v0.17.0](https://kind.sigs.k8s.io/)
- [helm package manager](https://helm.sh/docs/intro/install/)
- [k9s Version 0.27.0](https://github.com/derailed/k9s/releases) (optional)
