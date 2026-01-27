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

The task dataset will be published in three rounds. First, we publish a development dataset (dev set) in order to let everyone explore parts of the data in February. Second, the formal dataset will be released only for task participants in March. Following NTCIR, we make the full dataset subsequently publicly available in the end of 2026.

This task includes two subtasks. Participants can submit solutions to either or both subtasks.

### Subtask 1: Support Prediction

In this task, you predict if a given claim (text) is either `Supported` or `Refuted` by the given evidence (tables in PNG or LaTeX format and figures in PNG format). 

**Dataset:** Besides the claim, we provide contextual information, including the caption, immediate context of the claim, and a path to the full paper content (in JSON format). The `use_context` field provides the distinction if the context or the full paper is necessary to potentially disambiguit the claim. In this case, `use_context` contains either `yes` (requires the `context` field for disambiguation) or `other` (requires the full paper for disambiguation). The ground truth data, the test set, and the prediction format are all in JSON. We provide example snippets below.

<div style="display: flex;">
  <div style="flex: 1; padding: 0 10px; width: 50%; box-sizing: border-box; min-width: 0" markdown="1">
**Prediction Format:** This JSON is an example of the prediction format. All participants of subtask 1 are required to submit a results file in this format. The `claim_id` matches the `claim_id` in the data. The `pred_label` (prediction label) contains either `Supported` or `Refuted`.
  
```json
[
  {
    "claim_id": "val_tab_0001",
    "pred_label": "Refuted"
  }
]
```
  </div>
  <div style="flex: 1; padding: 0 10px; width: 50%; box-sizing: border-box; min-width: 0" markdown="1">
**Ground Truth:** This JSON is an example of a ground truth entry for subtask 1 with full information access.
  
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
</div>

------------------------

### Subtask 2: Evidence Prediction

In this task, you predict which of the two given evidences (tables and figures as above) supports the claim (text).

**Dataset:** The data follows the same format as for subtask 1 above with some small changes. The data contains now two fields for two evidence references `evidence_id_1` and `evidence_id_2` with the `label` pointing to the evidence ID that supports the claim. Both evidences are always of the same type (figure vs table and LaTeX or PNG). Furthermore, you can assume that exactly one evidence supports the claim. As in subtask 1, you are required to predict the label.

<div style="display: flex;">
  <div style="flex: 1; padding: 0 10px; width: 50%; box-sizing: border-box; min-width: 0" markdown="1">
**Prediction Format:** This JSON is an example of the prediction format for subtask 2. All participants of subtask 2 are required to submit a results file in this format. The `claim_id` matches the `claim_id` in the data. The `pred_label` (prediction label) contains either `evidence_id_1` or `evidence_id_2` depending on which evidence supports the claim.

```json
[
  {
    "sample_id": "val_0081",
    "pred_label": "evidence_id_1"
  }
]
```
  </div>
  <div style="flex: 1; padding: 0 10px; width: 50%; box-sizing: border-box; min-width: 0" markdown="1">
**Ground Truth:** This JSON is an example of a ground truth entry for subtask 2 with full information access.

```json
[
  {
    "sample_id": "val_0081",
    "question": "Which piece of evidence supports the claim? Only return the evidence ID (for example, evidence_id_1 or evidence_id_2).",
    "evidence_id_1": "figures/dev/val_fig_0113.png",
    "evidence_id_2": "figures/dev/val_fig_0114.png",
    "label": "evidence_id_1",
    "claim": "As shown in Figure 4(b) , increasing the value of \\alpha can prevent the model from outputting more sensitive information, but it may also lead to the loss of necessary information.",
    "context": "For unlearning, we found that adjusting the value of \\alpha can serve as a balance between forgetting and retaining .",
    "caption": "(a) Impact on instruction tuning; (b) Impact on unlearning; Impact of strength coefficient \\alpha on performance",
    "domain": "ml",
    "evi_type": "figure",
    "paper_id": "2410.17599",
    "use_context": "other sources",
    "operation": "Graph Flip",
    "paper_path": "papers/dev/ml_2410.17599.json",
    "detail_others": ""
  }
]
```
  </div>
</div>

------------------------

## News

- <a href="#registration-for-participation">Participation registration</a> for SciClaimEval is now available.

## Important Dates

| Date | Event |
| ---: | :--- |
| February | Dev Dataset Release |
| January - June | Dry Run |
| June 1, 2026 | Registration Deadline for Participants |
| March - July | Formal Run |
| August 1, 2026 | Evaluation Results Return |
| August 1, 2026 | Task Overview Release |
| September 1, 2026 | Submission Due for Participant's Papers |
| December 8 - 10, 2026 | NTCIR-19 Conference |

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
