---
# Feel free to add content and custom Front Matter to this file.
# To modify the layout, see https://jekyllrb.com/docs/themes/#overriding-theme-defaults

layout: home
---

<div class="sidebar-toc" markdown="1">
  <div class="toc-header">
    <img src="{{ site.baseurl }}/assets/logo.png" class="toc-logo" alt="Logo">
    <span class="toc-site-title">{{ site.title }}</span>
  </div>
  
  * TOC
  {:toc}
</div>

Welcome to **SciClaimEval**, a pilot task on the **verification of scientific claims against tables and figures** from scientific articles.
The task is organized as part of [NTCIR-19](https://research.nii.ac.jp/ntcir/ntcir-19/) and aims to evaluate systems that can reliably check the truthfulness of scientific statements using **multi-modal evidence**.

Scientific claim verification involves determining whether claims made in research papers are supported or refuted by accompanying evidence, such as experimental results, tables, and figures. With the rapid rise of generative AI and large language models (LLMs), the volume of scientific submissions has increased substantially, creating a growing demand for tools that can assist reviewers in assessing the validity and consistency of paper claims.

The **SciClaimEval** pilot task focuses on **cross-modal scientific claim verification**, aiming to assess whether textual claims in scientific papers are adequately supported by evidence from diverse modalities, namely **tables and figures**. We introduce a new benchmark dataset, constructed by extracting claims and their corresponding evidence from scientific articles across multiple domains, including **biomedicine, machine learning, and natural language processing**. The figure below illustrates an example from the benchmark dataset. The task involves determining whether a claim is **supported** or **refuted** given a piece of evidence (a table or a figure) and optional contextual information (preceding text in the original paragraph).

<div style="text-align: center; margin: 1.5em 0;">
    <img src="/assets/ntcir-19-dataset_example.png"
        alt="Description of the image"
        style="width: 90%; height: auto;" />
</div>

------------------------

## Synopsis

- ~~<a href="#registration-for-participation">Register</a> as participant by July 10, 2026~~
- ~~Submit your run on the test dataset by July 19, 2026~~
- ~~<a href="#submission-form">Make a submission</a> via our submission form~~
- Submit your paper draft by **September 1, 2026** <br>(Please refer to the <a href="https://research.nii.ac.jp/ntcir/ntcir-19/papers.html" target="_blank" rel="noopener">NTCIR-19 Paper Submission Instructions</a> for details.)

## Task Description

- Development Dataset: <a href="https://huggingface.co/datasets/alabnii/sciclaimeval-shared-task">huggingface.co/datasets/alabnii/sciclaimeval-shared-task</a>
- Formal Run Dataset: <a href="https://huggingface.co/datasets/alabnii/sciclaimeval-shared-task-test">huggingface.co/datasets/alabnii/sciclaimeval-shared-task-test</a>
- Evaluation scripts & examples: [github.com/SciClaimEval/sciclaimeval-shared-task](https://github.com/SciClaimEval/sciclaimeval-shared-task)

The task dataset will be published in three rounds. First, we publish a development dataset (dev set) in order to let everyone explore parts of the data on January 31. Second, the formal test dataset will be released only for task participants in March. Participants are required to submit their results on this formal run dataset! Following the NTCIR conference, we make all data subsequently publicly available by the end of 2026.

This task includes two subtasks. Participants can submit solutions to either or both subtasks.

### Dataset

The data consists of JSON files of all claims alongside figures (PNG), tables (PNG), and the full paper texts (JSON).
Each claim contains a unique path to an evidence file (`evi_path` for subtask 1 or `evidence_id_1`/`evidence_id_2` for subtask 2) and `evi_type` that indicates the type of evidence (either table or figure).
Additionally, we provide contextual information, including the caption (`caption`), immediate context of the claim (`context`), and a path to the full paper content (`paper_path`). The `use_context` field indicates whether additional context is necessary to potentially disambiguate the claim. Specifically, `use_context` contains either `no` (no additional context required), `yes` (requires the `context` field for disambiguation), or `other sources` (requires the full paper for disambiguation). 

**Optional**: For tables, we provide access to the original source format of the table (LaTeX or HTML). Participants are allowed to additionally submit results for subtask 1 on these formats besides the mandatory PNG formats. `evi_path_original` can be used as a unique path to the original variant.

### Subtask 1: Claim Label Prediction Task

In this subtask, you predict if a given claim (text) is either `Supported` or `Refuted` by the given evidence (tables and figures in PNG format).

<div style="display: flex;">
  <div style="flex: 1; padding: 0 10px; width: 50%; box-sizing: border-box; min-width: 0" markdown="1">
**Prediction Format:** All participants of subtask 1 are required to submit a results file in this format. The `claim_id` matches the `claim_id` in the data. The `pred_label` (prediction label) contains either `Supported` or `Refuted`. If your solution produces a confidence score for the prediction, you can add the optional `score` field to the submission. Any other fields will be ignored. A submission on other formats (see optional description above) will be distinguished in the submission form and not the result format.

```json
[
  {
    "claim_id": "val_tab_0001",
    "pred_label": "Refuted"
  }
]
```
  </div>
  <div style="flex: 1; padding: 0 10px; width: 50%; box-sizing: border-box; min-width: 0" class="long-pre-1" markdown="1">
**Test Format:** Example of a test entry for subtask 1.
  
```json
[
  {
    "paper_id": "2403.19137",
    "claim_id": "val_tab_0001",
    "claim": "Table 1 shows that our probabilistic inference module consistently outperforms its deterministic counterpart in terms of Avg and Last accuracy.",
    "caption": "Table 1 : Performance comparison of different methods averaged over three runs. Best scores are in bold . Second best scores are in blue . The results for L2P, DualPrompt, and PROOF are taken from [ 92 ] . See App. Table 14 for std. dev. scores.",
    "evi_type": "table",
    "evi_path": "tables_png/dev/val_tab_0001.png",
    "evi_path_original": "tables/dev/val_tab_0001.tex",
    "context": "To understand our probabilistic inference modules further, we examine their performance against the deterministic variant of ours (Ours w/o VI).",
    "domain": "ml",
    "use_context": "yes",
    "paper_path": "papers/dev/ml_2403.19137.json",
    "license_name": "CC BY 4.0",
    "license_url": "http://creativecommons.org/licenses/by/4.0/"
  }
]
```
  </div>
</div>

------------------------

### Subtask 2: Claim Evidence Prediction Task

In this subtask, you predict which of the two given pieces of evidence (tables and figures) supports the claim (text).

<div style="display: flex;">
  <div style="flex: 1; padding: 0 10px; width: 50%; box-sizing: border-box; min-width: 0" markdown="1">
**Prediction Format:** All participants of subtask 2 are required to submit a results file in this format. The `sample_id` matches the `sample_id` in the data. The `pred_label` (prediction label) contains either `evidence_id_1` or `evidence_id_2` depending on which evidence supports the claim. As for subtask 1, participants can provide an additional `score` flag to indicate the model's confidence.

```json
[
  {
    "sample_id": "val_0071",
    "pred_label": "evidence_id_1"
  }
]
```
  </div>
  <div style="flex: 1; padding: 0 10px; width: 50%; box-sizing: border-box; min-width: 0" class="long-pre-2" markdown="1">
**Test Format:** Example of a test entry for subtask 2.

```json
[
  {
    "sample_id": "val_0071",
    "evidence_id_1": "figures/dev/val_fig_0113.png",
    "evidence_id_2": "figures/dev/val_fig_0114.png",
    "claim": "As shown in Figure 4(b) , increasing the value of \\alpha can prevent the model from outputting more sensitive information, but it may also lead to the loss of necessary information.",
    "context": "For unlearning, we found that adjusting the value of \\alpha can serve as a balance between forgetting and retaining .",
    "caption": "(a) Impact on instruction tuning; (b) Impact on unlearning; Impact of strength coefficient \\alpha on performance",
    "domain": "ml",
    "evi_type": "figure",
    "paper_id": "2410.17599",
    "use_context": "other sources",
    "paper_path": "papers/dev/ml_2410.17599.json",
    "license_name": "CC BY 4.0",
    "license_url": "http://creativecommons.org/licenses/by/4.0/"
  }
]
```
  </div>
</div>

------------------------

### Evaluations & Baselines

The evaluation script (in python) is available on github: [github.com/SciClaimEval/sciclaimeval-shared-task](https://github.com/SciClaimEval/sciclaimeval-shared-task).

All submissions will be evaluated on precision, recall, macro F1, and accuracy. In order to minimize the risk of model bias on subtask 1, the primary evaluation metric here is accuracy on claim pairs (a claim pair are two entries in the dataset with the same claim but opposing evidence labels). This stricter metric only counts correct results if both entries of a pair were correctly predicted (i.e., the supported claim and refuted claim of the same claim text were correctly identified).

------------------------

## Results

The following tables show the results of all submissions on the evaluation set. In each table, only the best submission is shown directly. To see all run submissions from the same team, click on the specific row. Approaches and notes descriptions were given by the teams. All tables show the team names and baselines.

Subtask 1 was sorted by the primary metric 'pair accuracy' while subtask 2 was sorted by the primary metric 'accuracy'.

<link rel="stylesheet" href="{{ '/assets/css/tables.css' | relative_url }}">

<div class="evaluation-table">
  <div class="section-header-row">
    <div class="tab-nav" role="tablist" aria-label="Subtask 1 evidence format">
      <button class="tab-btn active" data-target="subtask1-png" role="tab" aria-selected="true">PNG</button>
      <button class="tab-btn" data-target="subtask1-json" role="tab" aria-selected="false">JSON</button>
      <button class="tab-btn" data-target="subtask1-tex" role="tab" aria-selected="false">TeX / HTML</button>
    </div>
    <h3 id="subtask-1" class="section-title">Subtask 1</h3>
  </div>

  <div class="tab-panel" id="subtask1-png">
    {% include results_table_subtask1.html data=site.data.subtask1_png panel_id="subtask1-png-zebra" %}
  </div>
  <div class="tab-panel" id="subtask1-json" hidden>
    {% include results_table_subtask1.html data=site.data.subtask1_json panel_id="subtask1-json-zebra" %}
  </div>
  <div class="tab-panel" id="subtask1-tex" hidden>
    {% include results_table_subtask1.html data=site.data.subtask1_tex panel_id="subtask1-tex-zebra" %}
  </div>
</div>

<div class="evaluation-table">
  <div class="section-header-row">
    <div class="tab-nav" role="tablist" aria-label="Subtask 2 evidence format">
      <button class="tab-btn active" data-target="subtask2-png" role="tab" aria-selected="true">PNG</button>
      <button class="tab-btn" data-target="subtask2-json" role="tab" aria-selected="false">JSON</button>
      <button class="tab-btn" data-target="subtask2-tex" role="tab" aria-selected="false">TeX / HTML</button>
    </div>
    <h3 id="subtask-2" class="section-title">Subtask 2</h3>
  </div>

  <div class="tab-panel" id="subtask2-png">
    {% include results_table_subtask2.html data=site.data.subtask2_png panel_id="subtask2-png-zebra" %}
  </div>
  <div class="tab-panel" id="subtask2-json" hidden>
    {% include results_table_subtask2.html data=site.data.subtask2_json panel_id="subtask2-json-zebra" %}
  </div>
  <div class="tab-panel" id="subtask2-tex" hidden>
    {% include results_table_subtask2.html data=site.data.subtask2_tex panel_id="subtask2-tex-zebra" %}
  </div>
</div>

<script src="{{ '/assets/js/tables.js' | relative_url }}"></script>

## News
- [2026-07-21] Submissions are now closed. Thanks to all participants. Remember the paper submission.
- [2026-06-17] EvalBot is now live. It automatically evaluates your submission and informs you via e-mail about your results within 30min.
- [2026-06-11] We created an FAQ page for participants. Check it out here: <a href="https://sciclaimeval.github.io/faq.html">sciclaimeval.github.io/faq.html</a>
- [2026-06-02] The registration deadline for participants has been extended until July 10.
- [2026-03-26] Dataset explorers are now available; please check them out here: <a href="https://sciclaimeval.github.io/explorer.html">sciclaimeval.github.io/explorer.html</a>.
- [2026-03-26] The JSON tables with human verification are now available. 
- [2026-03-13] The submission form is now available here: <a href="https://docs.google.com/forms/d/e/1FAIpQLSf3Vzu1MkCyqX3CHqBGOmVS2JGviIKTnYUyPQdEN7IoCq0g7A/viewform">forms-sciclaimeval-test-prediction-submission</a>.
- [2026-03-02] The test dataset is now available on huggingface: <a href="https://huggingface.co/datasets/alabnii/sciclaimeval-shared-task-test">alabnii/sciclaimeval-shared-task-test</a>.
- [2026-02-07] We published a paper explaining the task at LREC 2026. The pre-print is available on arXiv: <a href="https://arxiv.org/abs/2602.07621">SciClaimEval: Cross-modal Claim Verification in Scientific Papers</a>
- [2026-01-31] The development dataset is now available on huggingface: <a href="https://huggingface.co/datasets/alabnii/sciclaimeval-shared-task">alabnii/sciclaimeval-shared-task</a>.
- [2026-01-26] <a href="#registration-for-participation">Participation registration</a> for SciClaimEval is now available.



## Important Dates

| Date | Event |
| ---: | :--- |
| ~~January 31, 2026~~ | Development Dataset Release |
| ~~March 01, 2026~~ | Formal Run Dataset Release |
| ~~July 10, 2026~~ | Registration Deadline for Participants |
| ~~July 19, 2026~~ | Formal Run Submission Deadline |
| **August 1, 2026** | **Evaluation Results Return** |
| **September 1, 2026** | **Submission Due for Participant's Papers** |
| November 1, 2026 | Camera-ready participant paper due |
| December 8 - 10, 2026 | NTCIR-19 Conference |
| December 11, 2026 | Full Dataset Release |

All deadlines are 11.59 pm UTC -12h (Anywhere on Earth (AoE)).

## Registration for Participation

**The registration is now closed.**
~~To participate in the SciClaimEval task, participants must (1) register via the 19th NTCIR online registration system and (2) submit a signed memorandum.~~

<div style="text-align: center; margin: 1.5em 0;">
    <a
    target="_blank"
    rel="noopener"
    style="
        display: inline-block;
        padding: 10px 16px;
        background-color: #bebebe;
        color: white;
        text-decoration: none;
        border-radius: 4px;
        font-weight: 600;
    ">
    Register for Participation
    </a>
</div>


## Submission Form
**The submission of runs is now closed.**
~~You can submit your prediction file for the test data here.~~

<div style="text-align:center; margin:1.5em 0;">
  <a
    target="_blank" rel="noopener"
    style="
      display: inline-block; 
      padding: 10px 16px; 
      background-color: #bebebe;
      color: white; 
      border: none; 
      border-radius: 4px; 
      font-weight: 600; 
      font-size: 1em; 
      ursor: pointer; 
      text-decoration: none;
    ">
    Submit a run
  </a>
</div>


## Contact

Please direct any questions or corrections regarding the task to: sciclaimeval (at) gmail.com

## Cite Us

To cite this work, please use the following BibTeX. 
*We will update the URL and page numbers once the official LREC 2026 proceedings are released.*

```bibtex
@inproceedings{ho-etal-2026-sciclaimeval,
  title = {SciClaimEval: Cross-modal Claim Verification in Scientific Papers},
  author = {Ho, Xanh and Wu, Yun-Ang and Kumar, Sunisth and Xia, Tian Cheng and Boudin, Florian and Greiner-Petter, Andre and Aizawa, Akiko},
  booktitle = {Proceedings of the Fifteenth Language Resources and Evaluation Conference (LREC 2026)},
  month = {May},
  year = {2026},
  pages = {11060--11071},
  address = {Palma, Mallorca, Spain},
  publisher = {European Language Resources Association (ELRA)},
  editor = {Piperidis, Stelios and Bel, Núria and van den Heuvel, Henk and Ide, Nancy and Krek, Simon and Toral, Antonio},
  doi = {10.63317/4ap9rg2gnwmf}
}
```

## Organizers

- [Akiko Aizawa](https://www-al.nii.ac.jp/en/home-2/) (National Institute of Informatics, Japan)
- [André Greiner-Petter](https://gipplab.uni-goettingen.de/team/dr-andre-greiner-petter/) (University of Göttingen, Germany)
- [Florian Boudin](https://boudinfl.github.io/) (Inria, France)
- [Xanh Ho](https://xanhho.github.io/) (National Institute of Informatics, Japan)

## Explorer

Explore pairs of scientific claims with supporting and refuting evidence in our interactive [Examples Explorer](/explorer.html).

## FAQ

Have a question about the task, data, or submission? Check the answers to common questions on our [FAQ page](/faq.html).
