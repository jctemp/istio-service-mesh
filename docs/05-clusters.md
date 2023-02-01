# Creating clusters

It is necessary to download a particular [preview version](https://gcsweb.istio.io/gcs/istio-build/dev/0.0.0-ambient.191fe680b52c1754ee72a06b3e0d3f9d116f2e82) to create a cluster with ambient mesh functionalities.
The current Istio version `1.16.2` already supports the new communication protocol `HBONE`, but it does not contain the ztunnels.

```bash
FILE="istio-0.0.0-ambient.191fe680b52c1754ee72a06b3e0d3f9d116f2e82-linux-amd64.tar.gz"
URL="https://storage.googleapis.com/istio-build/dev/0.0.0-ambient.191fe680b52c1754ee72a06b3e0d3f9d116f2e82"

curl -LO "$URL/$FILE"
curl -LO "$URL/$FILE.sha256"
```

Verify the downloaded preview version.

```bash
echo $(cat $FILE.sha256) | sha256sum --check
```

Unpack the compressed tarball and enter the directory.

```bash
DEST=istio-0.0.0-ambient
mkdir $DEST && tar xzf $FILE --strip-components 1 -C $DEST && cd $DEST
```

!!!tip
    You can create a symlink to the `istioctl` executable and add it to the `/usr/local/bin` path to make it available globally.
    Like that you are not required to type the path to the binary.

    ```bash
    sudo ln -s $(pwd)/bin/istioctl /usr/local/bin/istioctl
    ```

## Handling clusters

Next, we want to be able to create different clusters.
Therefore, make a new file called `template.yaml` and add the code below.

```yaml title="template.yaml"
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4

# Identifier of the cluster
name: {name}

# Create three nodes
nodes:
- role: control-plane
- role: worker
- role: worker
```

With that template, we can create three distinct versions of the file, where we change the name of the cluster.
We need the three nodes for the `book info` example.

```bash
for NAME in "ambient" "ambient-waypoint" "traditional"; do
    cp ./template.yaml ./$NAME.yaml
    SED_STR="s/{name}/$NAME/g"
    sed -i -e "$SED_STR" ./$NAME.yaml
done
```

Finally, we can use the `kind` tool to create a local cluster based on the configuration file.

```bash
NAME="ambient"
kind create cluster --config $NAME.yaml
```

After creating a cluster, we can use the `k9s` tool to browse the various components.
At this point, it should be empty as only the essential services are deployed to operate the cluster with `kubectl`.
Further valuable commands are:

```bash
# list all available clusters
kind get clusters

# delete a cluster
kind delete clusters <name>
```

The last step before deploying the application is to install an Istio profile in the cluster.
You can list all the available profiles with `istioctl profile list`.
It also should contain the ambient profile.
Finally, install Istio will the following command:

```bash
istioctl install -y --set profile=ambient
```

## Deployment of the application

For the benchmarking, we will use the `book info` example because Istio well documented references.
We have below two guides the explain the deployment of the application.
The traditional guide has a more detailed explaination about the `book info` example.
Further, the ambient guide can be some times errorness and troubleshooting was difficult.

- [traditional guide](https://istio.io/latest/docs/examples/bookinfo/#deploying-the-application)
- [ambient guide](https://istio.io/latest/blog/2022/get-started-ambient/#deploy-your-applications)

## Metric observation of a cluster

Ensure you have installed the Istio service mesh because otherwise this installation will fail.
Istio provides with every release an addons folder.
Inside that folder, there are pre-made `.yaml` files which deploy `Prometheus` and `Grafana` that allow the observation of a cluster.
Note that these presets are only helpful for small-scale clusters and should be sufficient for this test.

```bash
kubectl apply -f ./samples/addons/grafana.yaml
kubectl apply -f ./samples/addons/prometheus.yaml
```

These two add-ons aim to monitor the system's resource usage and visualise the data accordingly.
We could optimise the add-ons; However, this should be optional for this scale.

TODO (better dashboard for grafana)
