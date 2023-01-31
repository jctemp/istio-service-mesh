# Welcome

This repository gives more context regarding the setup of Istio's ambient mesh and traditional service mesh.
It is using the `bookinfo` example to demonstate the performance difference between the two service meshes.
Further, it is important to note that this is an academic example and that benchmarks are necessary to understand true behaviour.
Nonetheless, the benchmark aims to show tendencies and the opportunity of the new approach.

## Requirements

To perform the experiment, you will need the listed software below.
With that, we can create a local cluster using `kind`.
The `k9s` is just a command line interface allowing to browse the cluster.

- [Docker Version 20.10.23](https://docs.docker.com/engine/install/)
- [Kubernetes CLI Version 1.26.1](https://kubernetes.io/docs/tasks/tools/)
- [Go Version 1.19.5](https://go.dev/dl/)
- [kind Version v0.17.0](https://kind.sigs.k8s.io/)
- [k9s Version 0.27.0](https://github.com/derailed/k9s/releases) (optional)

The next section contains a quick installation guide.
Skip that if you already have the required software.
