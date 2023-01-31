# Creating clusters

TODO

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

TODO

```bash
DEST=istio-0.0.0-ambient
mkdir $DEST && tar xzf $FILE --strip-components 1 -C $DEST && cd $DEST
```

TODO

```bash
ln -s $(pwd)/bin/istioctl /usr/local/bin/istioctl
```

TODO
Now, follow the installation of the ambient mesh and bookinfo example.
