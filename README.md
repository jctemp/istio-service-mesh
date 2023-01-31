# istio-service-mesh

To see the docs, install `mkdocs` with the pip package manager. Optionally, create a virtual environment.

```bash
python -m venv venv
./venv/Scripts/activate
pip install -r requirements.txt
```

Now, we can serve the page with `mkdocs serve` and see the local website.

## Project layout

```py
docs/           # the infromation about the benchmark is here
    index.md    # - landing page
    setup.md    # - benchmark setup
    sources.md  # - resources
scripts/        # simple helper scripts to get started
    ...
.gitingore
LICENSE
mkdocs.yml
README.md
requirements.txt
```
