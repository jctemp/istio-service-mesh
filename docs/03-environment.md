# Environment

We used a VPS with four cores and 8GB of RAM for the benchmark.
The installed OS is Ubuntu 22.04.1, as it offers the best compatibility.
Details of the VPS are listed below.

```bash
OS: Ubuntu 22.04.1 LTS x86_64
Host: KVM/QEMU (Standard PC (i440FX + PIIX, 1996) 
Kernel: 5.15.0-25-generic
Shell: bash 5.1.16
CPU: AMD EPYC 7282 (4) @ 2.794GHz
Memory: 377MiB / 7951MiB
```

Alternatively, you can use a virtual environment on your host machine.
However, ensure the VM has enough resources to deploy the cluster with services.
We found that a similar spec to the VPS worked best.
