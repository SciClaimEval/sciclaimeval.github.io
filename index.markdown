---
# Feel free to add content and custom Front Matter to this file.
# To modify the layout, see https://jekyllrb.com/docs/themes/#overriding-theme-defaults

layout: home
---

Welcome to **SciClaimEval**, a pilot task on the **verification of scientific claims against tables and figures** from scientific articles.
The task is organized as part of [NTCIR-19](https://research.nii.ac.jp/ntcir/ntcir-19/) and aims to evaluate systems that can reliably check the truthfulness of scientific statements using **multi-modal evidence**.

Scientific claim verification involves determining whether claims made in research papers are supported or refuted by accompanying evidence, such as experimental results, tables, and figures. With the rapid rise of generative AI and large language models (LLMs), the volume of scientific submissions has increased substantially, creating a growing demand for tools that can assist reviewers in assessing the validity and consistency of paper claims.

The **SciClaimEval** pilot task focuses on **cross-modal scientific claim verification**, aiming to assess whether textual claims in scientific papers are adequately supported by evidence from diverse modalities, namely **tables and figures**. We introduce a new benchmark dataset, constructed by extracting claims and their corresponding evidence from scientific articles across multiple domains, including **biomedicine, machine learning, and natural language processing**. The figure below illustrates an example from the benchmark dataset. The task consists in determining whether a claim is **supported** or **refuted** given a piece of evidence (a table or a figure) and optional contextual information (preceding text in the original paragraph).

<div style="text-align: center; margin: 1.5em 0;">
    <img src="/assets/ntcir-19-dataset_example.png"
        alt="Description of the image"
        style="width: 90%; height: auto;" />
</div>

## Task Description

- The dataset is available here: tba.

### Task 1: Support Prediction

In this task, you predict if a given claim (text) is either `Supported` or `Refuted` by the given evidence (tables in PNG or LaTeX format and figures in PNG format). The ground truth as well as the prediction formats are in JSON with examples below.

<div style="display: flex;">
  <div style="flex: 1; padding: 0 10px;" markdown="1">
Example of the ground truth data.
  
```json
[
  {
    "paper_id": "2403.19137",
    "claim_id": "val_tab_0001",
    "claim": "Table 1 shows that our probabilistic inference module consistently outperforms its deterministic counterpart in terms of Avg and Last accuracy.",
    "label": "Supported",
    "caption": "Table 1 : Performance comparison of different methods averaged over three runs. Best scores are in bold . Second best scores are in blue . The results for L2P, DualPrompt, and PROOF are taken from [ 92 ] . See App. Table 14 for std. dev. scores.",
    "evi_type": "table",
    "evi_path": "tables/dev/val_tab_0001.tex",
    "context": "To understand our probabilistic inference modules further, we examine their performance against the deterministic variant of ours (Ours w/o VI).",
    "domain": "ml",
    "use_context": "yes",
    "operation": "Change the cell values",
    "paper_path": "papers/dev/ml_2403.19137.json",
    "detail_others": "",
    "claim_id_pair": "0001"
  }
]
```
  </div>
  <div style="flex: 1; padding: 0 10px;" markdown="1">
Example of the prediction format.
  
```json
[
  {
    "claim_id": "val_tab_0001",
    "pred_label": "Refuted"
  }
]
```
  </div>
</div>

### Task 2: Evidence Prediction

In this task, you predict which evidence (tables and figures as above) support the given claim (text). You can assume that there is one evidence that supports the claim, while the others are altered in a way that refutes the claim. As above, the ground truth and prediction formats are in JSON with examples below.

<div style="display: flex;">
  <div style="flex: 1; padding: 0 10px;" markdown="1">
Example of the ground truth data for Task 2:

```json
tba
```
  </div>
  <div style="flex: 1; padding: 0 10px;" markdown="1">
Example of the prediction format for Task 2:
  
```json
tba
```
  </div>
</div>

## News

- <a href="#registration-for-participation">Participation registration</a> for SciClaimEval is now available.

## Important Dates

- January 2026 - Dataset release
- January-June 2026 - Dry run
- June 1, 2026 - Registration deadline for participation
- March-July 2026 - Formal run
- August 1, 2026 - Evaluation results return
- August 1, 2026 - Task overview release
- September 1, 2026 - Submission due of participant papers
- December 8-10, 2026 - NTCIR-19 conference

## Registration for Participation

To participate in the SciClaimEval task, participants must (1) register via the 19th NTCIR online registration system and (2) submit a signed memorandum.

<div style="text-align: center; margin: 1.5em 0;">
    <a href="https://research.nii.ac.jp/ntcir/ntcir-19/howto.html"
    target="_blank"
    rel="noopener"
    style="
        display: inline-block;
        padding: 10px 16px;
        background-color: #0066cc;
        color: white;
        text-decoration: none;
        border-radius: 4px;
        font-weight: 600;
    ">
    Register for Participation
    </a>
</div>

## Organizers

- [Akiko Aizawa](https://www-al.nii.ac.jp/en/home-2/) (National Institute of Informatics)
- [André Greiner-Petter](https://gipplab.uni-goettingen.de/team/dr-andre-greiner-petter/) (University of Göttingen, Germany)
- [Florian Boudin](https://boudinfl.github.io/) (Inria, France)
- [Xanh Ho](https://xanhho.github.io/) (National Institute of Informatics)
