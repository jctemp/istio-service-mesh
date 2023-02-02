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

Next, we want to be able to create a cluster.
Therefore, make a new file called `kind-cluster.yaml`, which contains the code below.
Alternatively, we can use the version in the `src/kind-cluster.yaml`.

```yaml title="kind-cluster.yaml"
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4

# Identifier of the cluster
name: cluster

# Create three nodes
nodes:
- role: control-plane
- role: worker
- role: worker
```

The template create a cluster with three nodes in total.
This provides the basis for the `book info` example.
We can use the `kind` tool to create a local cluster based on the configuration file.

```bash
kind create cluster --config kind-cluster.yaml
```

After creating a cluster, we can use the `k9s` tool to browse the various components.
At this point, it should be empty as only the essential services are deployed to operate the cluster with `k8s`.

!!! tip
    Note that `kind` has further valuable commands to list or delete the present clusters.

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

## Metric observation of a cluster

Ensure you have installed the Istio service mesh because otherwise this installation will fail.
Next, we will add `Prometheus` and `Grafana` to the service mesh.
These two add-ons aim to monitor the system's resource usage and visualise the data accordingly.

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
```

After we have added the prometheus repository, it is possible to install the `Prometheus` application with `Grafana`.
Now, create the followig file or used the version in the `src/values.yaml`.

```yaml title="values.yaml"
alertmanager:
  enabled: false
kubeStateMetrics:
  enabled: false
nodeExporter:
  enabled: true 
prometheus:
  prometheusSpec:
    retention: 60d
grafana:
  imageRenderer: enabled
hostNetwork: true
```

Finally, we can install the `Prometheus` application to the Kubernetes cluster.
Note that the `values.yaml` must be in the working directory.

```bash
helm install kube-prometheus-stack \
    prometheus-community/kube-prometheus-stack \
    --namespace monitoring \
    --version 44.3.0 \
    --create-namespace \
    -f values.yaml
```

!!! note
    Optionally, we can remove the installed observe by executing the following command.

    ```bash
    helm uninstall kube-prometheus-stack --namespace monitoring
    ``` 

The `Grafana` dashboard can be exposed to the localhost with the followig command.
Note that the user is `admin` and the password is `prom-operator`.
Alternatively, you can use the `grafana` script in the `/src` folder.

```bash
kubectl port-forward deployment/prometheus-metrics-grafana -n monitoring 3000 > /dev/null
```

Finally, you can add the following dashboard to the `Grafana` application.
As the other file, it is available in GitHub repository.

```json title="dashboard.json"
{"annotations":{"list":[{"builtIn":1,"datasource":"-- Grafana --","enable":true,"hide":true,"iconColor":"rgba(0, 211, 255, 1)","name":"Annotations & Alerts","target":{"limit":100,"matchAny":false,"tags":[],"type":"dashboard"},"type":"dashboard"}]},"description":"A dashboard to help with cost and utilisation","editable":true,"fiscalYearStartMonth":0,"gnetId":6876,"graphTooltip":1,"id":26,"links":[],"liveNow":false,"panels":[{"fieldConfig":{"defaults":{"color":{"mode":"palette-classic"},"custom":{"axisLabel":"","axisPlacement":"auto","barAlignment":0,"drawStyle":"line","fillOpacity":0,"gradientMode":"none","hideFrom":{"legend":false,"tooltip":false,"viz":false},"lineInterpolation":"linear","lineWidth":1,"pointSize":5,"scaleDistribution":{"type":"linear"},"showPoints":"auto","spanNulls":false,"stacking":{"group":"A","mode":"normal"},"thresholdsStyle":{"mode":"off"}},"mappings":[],"thresholds":{"mode":"absolute","steps":[{"color":"green","value":null},{"color":"red","value":80}]}},"overrides":[]},"gridPos":{"h":8,"w":12,"x":0,"y":0},"id":113,"options":{"legend":{"calcs":["min","mean","max"],"displayMode":"table","placement":"bottom"},"tooltip":{"mode":"single"}},"pluginVersion":"8.3.3","targets":[{"datasource":{"type":"prometheus","uid":"Prometheus"},"exemplar":true,"expr":"sum(rate(container_cpu_usage_seconds_total{container=\"istio-proxy\"}[5m])) by (pod)","format":"time_series","hide":false,"instant":false,"interval":"","legendFormat":"{{pod}}","refId":"B"},{"datasource":{"type":"prometheus","uid":"Prometheus"},"exemplar":true,"expr":"sum(rate(container_cpu_usage_seconds_total{container=\"istio-proxy\"}[5m]))","hide":true,"interval":"","legendFormat":"Total CPU","refId":"A"}],"title":"Total Sidecar/Ambient CPU per pod (stacked)","type":"timeseries"},{"fieldConfig":{"defaults":{"color":{"mode":"palette-classic"},"custom":{"axisLabel":"","axisPlacement":"auto","barAlignment":0,"drawStyle":"line","fillOpacity":0,"gradientMode":"none","hideFrom":{"legend":false,"tooltip":false,"viz":false},"lineInterpolation":"linear","lineWidth":1,"pointSize":5,"scaleDistribution":{"type":"linear"},"showPoints":"auto","spanNulls":false,"stacking":{"group":"A","mode":"normal"},"thresholdsStyle":{"mode":"off"}},"mappings":[],"thresholds":{"mode":"absolute","steps":[{"color":"green","value":null}]},"unit":"bytes"},"overrides":[]},"gridPos":{"h":8,"w":12,"x":12,"y":0},"id":114,"options":{"legend":{"calcs":["min","mean","max"],"displayMode":"table","placement":"bottom"},"tooltip":{"mode":"single"}},"pluginVersion":"8.3.3","targets":[{"datasource":{"type":"prometheus","uid":"Prometheus"},"exemplar":true,"expr":"sum(container_memory_working_set_bytes{container=\"istio-proxy\", pod!~\"istio-ingressgateway-.*\"}) by (pod)","interval":"","legendFormat":"{{pod}}","refId":"A"},{"datasource":{"type":"prometheus","uid":"Prometheus"},"exemplar":true,"expr":"sum(container_memory_working_set_bytes{container=\"istio-proxy\", pod!~\"istio-ingressgateway-.*\"})","hide":true,"interval":"","legendFormat":"Total memory","refId":"B"}],"title":"Total Sidecar/Ambient RAM per pod (stacked)","type":"timeseries"},{"fieldConfig":{"defaults":{"color":{"mode":"palette-classic"},"custom":{"axisLabel":"","axisPlacement":"auto","barAlignment":0,"drawStyle":"line","fillOpacity":0,"gradientMode":"none","hideFrom":{"legend":false,"tooltip":false,"viz":false},"lineInterpolation":"linear","lineWidth":1,"pointSize":5,"scaleDistribution":{"type":"linear"},"showPoints":"auto","spanNulls":false,"stacking":{"group":"A","mode":"none"},"thresholdsStyle":{"mode":"off"}},"mappings":[],"thresholds":{"mode":"absolute","steps":[{"color":"green","value":null},{"color":"red","value":80}]}},"overrides":[]},"gridPos":{"h":8,"w":12,"x":0,"y":8},"id":108,"options":{"legend":{"calcs":["max"],"displayMode":"table","placement":"bottom"},"tooltip":{"mode":"single"}},"pluginVersion":"8.3.3","targets":[{"datasource":{"type":"prometheus","uid":"Prometheus"},"exemplar":true,"expr":"sum(rate(container_cpu_usage_seconds_total{container=\"istio-proxy\"}[5m])) by (pod)","format":"time_series","hide":false,"instant":false,"interval":"","legendFormat":"{{pod}}","refId":"B"},{"datasource":{"type":"prometheus","uid":"Prometheus"},"exemplar":true,"expr":"sum(rate(container_cpu_usage_seconds_total{container=\"istio-proxy\"}[5m]))","hide":true,"interval":"","legendFormat":"Total CPU","refId":"A"}],"title":"Total Sidecar/Ambient CPU per pod","type":"timeseries"},{"fieldConfig":{"defaults":{"color":{"mode":"palette-classic"},"custom":{"axisLabel":"","axisPlacement":"auto","barAlignment":0,"drawStyle":"line","fillOpacity":0,"gradientMode":"none","hideFrom":{"legend":false,"tooltip":false,"viz":false},"lineInterpolation":"linear","lineWidth":1,"pointSize":5,"scaleDistribution":{"type":"linear"},"showPoints":"auto","spanNulls":false,"stacking":{"group":"A","mode":"none"},"thresholdsStyle":{"mode":"off"}},"mappings":[],"thresholds":{"mode":"absolute","steps":[{"color":"green","value":null}]},"unit":"bytes"},"overrides":[]},"gridPos":{"h":8,"w":12,"x":12,"y":8},"id":106,"options":{"legend":{"calcs":["max"],"displayMode":"table","placement":"bottom"},"tooltip":{"mode":"single"}},"pluginVersion":"8.3.3","targets":[{"datasource":{"type":"prometheus","uid":"Prometheus"},"exemplar":true,"expr":"sum(container_memory_working_set_bytes{container=\"istio-proxy\", pod!~\"istio-ingressgateway-.*\"}) by (pod)","interval":"","legendFormat":"{{pod}}","refId":"A"},{"datasource":{"type":"prometheus","uid":"Prometheus"},"exemplar":true,"expr":"sum(container_memory_working_set_bytes{container=\"istio-proxy\", pod!~\"istio-ingressgateway-.*\"})","hide":true,"interval":"","legendFormat":"Total memory","refId":"B"}],"title":"Total Sidecar/Ambient RAM per pod","type":"timeseries"},{"fieldConfig":{"defaults":{"color":{"mode":"palette-classic"},"custom":{"axisLabel":"","axisPlacement":"auto","barAlignment":0,"drawStyle":"line","fillOpacity":0,"gradientMode":"none","hideFrom":{"legend":false,"tooltip":false,"viz":false},"lineInterpolation":"linear","lineWidth":1,"pointSize":5,"scaleDistribution":{"type":"linear"},"showPoints":"auto","spanNulls":false,"stacking":{"group":"A","mode":"none"},"thresholdsStyle":{"mode":"off"}},"mappings":[],"thresholds":{"mode":"absolute","steps":[{"color":"green","value":null},{"color":"red","value":80}]}},"overrides":[]},"gridPos":{"h":8,"w":12,"x":0,"y":16},"id":111,"options":{"legend":{"calcs":[],"displayMode":"list","placement":"bottom"},"tooltip":{"mode":"single"}},"pluginVersion":"8.3.3","targets":[{"datasource":{"type":"prometheus","uid":"Prometheus"},"exemplar":true,"expr":"sum(rate(container_cpu_usage_seconds_total{container=\"istio-proxy\"}[1m]))","hide":true,"interval":"","legendFormat":"Total CPU","refId":"A"},{"datasource":{"type":"prometheus","uid":"Prometheus"},"exemplar":true,"expr":"max_over_time(sum(rate(container_cpu_usage_seconds_total{container=\"istio-proxy\"}[5m]))[30m:1m])","hide":false,"interval":"","legendFormat":"Max over time CPU","refId":"C"}],"title":"Max Sidecar/Ambient CPU","type":"timeseries"},{"fieldConfig":{"defaults":{"color":{"mode":"palette-classic"},"custom":{"axisLabel":"","axisPlacement":"auto","barAlignment":0,"drawStyle":"line","fillOpacity":0,"gradientMode":"none","hideFrom":{"legend":false,"tooltip":false,"viz":false},"lineInterpolation":"linear","lineWidth":1,"pointSize":5,"scaleDistribution":{"type":"linear"},"showPoints":"auto","spanNulls":false,"stacking":{"group":"A","mode":"none"},"thresholdsStyle":{"mode":"off"}},"mappings":[],"thresholds":{"mode":"absolute","steps":[{"color":"green","value":null}]},"unit":"bytes"},"overrides":[]},"gridPos":{"h":8,"w":12,"x":12,"y":16},"id":112,"options":{"legend":{"calcs":[],"displayMode":"list","placement":"bottom"},"tooltip":{"mode":"single"}},"pluginVersion":"8.3.3","targets":[{"datasource":{"type":"prometheus","uid":"Prometheus"},"exemplar":true,"expr":"sum(container_memory_working_set_bytes{container=\"istio-proxy\", pod!~\"istio-ingressgateway-.*\"}) by (pod)","hide":true,"interval":"","legendFormat":"{{pod}}","refId":"A"},{"datasource":{"type":"prometheus","uid":"Prometheus"},"exemplar":true,"expr":"sum(container_memory_working_set_bytes{container=\"istio-proxy\", pod!~\"istio-ingressgateway-.*\"})","hide":true,"interval":"","legendFormat":"Total memory","refId":"B"},{"datasource":{"type":"prometheus","uid":"Prometheus"},"exemplar":true,"expr":"max_over_time(sum(container_memory_working_set_bytes{container=\"istio-proxy\", pod!~\"istio-ingressgateway-.*\"})[30m:1m])","hide":false,"interval":"","legendFormat":"Max over time memory","refId":"C"}],"title":"Max Sidecar/Ambient RAM","type":"timeseries"},{"fieldConfig":{"defaults":{"color":{"mode":"palette-classic"},"custom":{"axisLabel":"","axisPlacement":"auto","barAlignment":0,"drawStyle":"line","fillOpacity":0,"gradientMode":"none","hideFrom":{"legend":false,"tooltip":false,"viz":false},"lineInterpolation":"linear","lineStyle":{"fill":"solid"},"lineWidth":1,"pointSize":5,"scaleDistribution":{"type":"linear"},"showPoints":"auto","spanNulls":false,"stacking":{"group":"A","mode":"none"},"thresholdsStyle":{"mode":"off"}},"mappings":[],"thresholds":{"mode":"absolute","steps":[{"color":"green","value":null},{"color":"red","value":80}]}},"overrides":[]},"gridPos":{"h":8,"w":12,"x":0,"y":24},"id":104,"options":{"legend":{"calcs":[],"displayMode":"list","placement":"bottom"},"tooltip":{"mode":"single"}},"pluginVersion":"8.3.3","targets":[{"datasource":{"type":"prometheus","uid":"Prometheus"},"exemplar":true,"expr":"sum(rate(container_cpu_usage_seconds_total{namespace=~\"test.*\"}[5m]))","interval":"","legendFormat":"Total CPU of workloads","refId":"A"},{"datasource":{"type":"prometheus","uid":"PBFA97CFB590B2093"},"exemplar":true,"expr":"sum(rate(container_cpu_usage_seconds_total{namespace=~\"istio-system|test.*\", container=\"istio-proxy\"}[5m]))","hide":false,"instant":false,"interval":"","intervalFactor":1,"legendFormat":"Total CPU of Istio data path","refId":"B"}],"title":"Total CPU of workloads","type":"timeseries"},{"fieldConfig":{"defaults":{"color":{"mode":"palette-classic"},"custom":{"axisLabel":"","axisPlacement":"auto","barAlignment":0,"drawStyle":"line","fillOpacity":10,"gradientMode":"none","hideFrom":{"legend":false,"tooltip":false,"viz":false},"lineInterpolation":"linear","lineWidth":1,"pointSize":5,"scaleDistribution":{"type":"linear"},"showPoints":"never","spanNulls":false,"stacking":{"group":"A","mode":"none"},"thresholdsStyle":{"mode":"off"}},"mappings":[],"thresholds":{"mode":"absolute","steps":[{"color":"green","value":null},{"color":"red","value":80}]},"unit":"bytes"},"overrides":[]},"gridPos":{"h":8,"w":12,"x":12,"y":24},"id":110,"options":{"legend":{"calcs":[],"displayMode":"list","placement":"bottom"},"tooltip":{"mode":"single"}},"pluginVersion":"8.3.3","targets":[{"datasource":{"type":"prometheus","uid":"Prometheus"},"exemplar":true,"expr":"sum(container_memory_working_set_bytes{namespace=~\"test.*\"})","interval":"","legendFormat":"Total memory of workloads","refId":"A"},{"datasource":{"type":"prometheus","uid":"PBFA97CFB590B2093"},"exemplar":true,"expr":"sum(container_memory_working_set_bytes{namespace=~\"istio-system|test.*\", container=\"istio-proxy\"})","hide":false,"interval":"","legendFormat":"Total memory of Istio datapath","refId":"B"}],"title":"Total RAM of workloads","type":"timeseries"}],"refresh":false,"schemaVersion":34,"style":"dark","tags":[],"templating":{"list":[]},"time":{"from":"now-3h","to":"now"},"timepicker":{"hidden":false,"refresh_intervals":["5s","10s","30s","1m","5m","15m","30m","1h","2h","1d"],"time_options":["5m","15m","1h","6h","12h","24h","2d","7d","30d"]},"timezone":"utc","title":"Istio Performance Analysis Dashboard","uid":"croBncMVz","version":12,"weekStart":""}
```

!!! example "Reverse Proxy"
    If you do not have direct access to your machine, like us, you can use a reverse proxy to expose the `Grafana` application.
    To do so, install the `nginx` server.

    ```bash
    sudo apt install -y nginx
    ```

    Next, we have to start the application and enable it, if we want to have it started after a restart.
    Further, print the status of the `nginx` server to check for error.

    ```bash
    sudo systemctl start nginx
    sudo systemctl enable nginx
    sudo systemctl status nginx
    ```

    Now, we can add a configuration file `grafana.conf` to the nginx path `/etc/nginx/conf.d/` and optionally check the syntax with `nginx -t`.

    ```conf title="grafana.conf"
    server {
        listen 20000;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

        location / {
            proxy_pass http://localhost:3000/;
        }
    }
    ```

    Finally, restart the `nginx` server and access the `Grafana` dashboard via your browser.
    Don't forget to add the port!

    ```bash
    sudo systemctl restart nginx
    sudo systemctl status nginx
    ```

## Deployment of the application

For the benchmarking, we will use the `book info` example because Istio well documented references.
We have below two guides the explain the deployment of the application.
The traditional guide has a more detailed explaination about the `book info` example.
Further, the ambient guide can be some times errorness and troubleshooting was difficult.

- [traditional guide](https://istio.io/latest/docs/examples/bookinfo/#deploying-the-application)
- [ambient guide](https://istio.io/latest/blog/2022/get-started-ambient/#deploy-your-applications)
