# create-tag

A GitHub Action to tag a commit with a valid semantic version.

For example:

```yaml
name: Tag

on:
  workflow_dispatch:
    inputs:
      version:
        description: 'Release version (e.g. v0.1.0)'
        required: true
      message:
        description: 'Tag message'
        required: true

jobs:
  create-tag:
    runs-on: ubuntu-18.04

    steps:
      - name: Checkout
        uses: actions/checkout@v2

      - name: Create tags in extensions repos
        uses: bonfire-networks/create-tags-multirepo@v0.5
        with:
          version: ${{ steps.version.outputs.current-version }}
          message: ${{ github.event.inputs.message }}
          token: ${{ secrets.GH_TOKEN }}
          owner: "bonfire-networks"
          repos: "one,two"
```
