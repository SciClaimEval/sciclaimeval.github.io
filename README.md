# SciClaimEval

This is the webpage for the SciClaimEval pilot task.

## Local deployment

The website is based on Jekyll. To run it locally, you need to install jekyll via:
```sh
gem install jekyll bundler
```

Afterwards, you can run the website locally via:
```sh
bundle install
bundle exec jekyll serve
```

This should start the service on `127.0.0.1:4000`.

## Update result tables

First, update the excel file in `assets/SciClaimEval26_Results.xlsx` than run `python results_processor.py`. After that, just refresh the website.

In order to run the python script (which analyzes the Excel file and generates a JSON file), you need to install requirements `pip install -r requirements.txt`