# Benchmarks

For the last test, we have provided some scripts in the `/src` folder that make changes to the cluster a bit easier.
The first step is to add the `k6` pods to the cluster.
Therefore, create a file `k6.yaml` in your current working directory and execute the following command:

```bash
kubectl apply -f k6.yaml
```

After the `k6` application is deployed in the cluster, we need to add a script file that allow us to make the stress test.

```bash
kubectl cp /path/to/script.js <some-namespace>/<some-pod>:/home/k6/
```

Finally, we can use the the other two scripts to start the last test and change the replica count for the `book info` application.

- `stress-test`
- `replica-scaling`

## Limitations

Measuring the metrics inside the cluster can be inaccurate or not representative as high strain on the system can be caused partially through the scraping of data.
Nonetheless, for this small example it should be sufficient to deploy a pre-configured version of `Prometheus` and scape the metrics.
Further, the cluster have limited resources regarding the amount of load.
Accordingly, it would be necessary to re-do the expriment in a large scale environment.

## Our results

```txt
Virtual users: 20
Duration: 300s
```
