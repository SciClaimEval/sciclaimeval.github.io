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

- <a href="#registration-for-participation">Register</a> as participant by **June 1, 2026**
- Submit your run on the test dataset by **July 19, 2026**
- Submit your paper draft by **September 1, 2026**

## Task Description

- Development Dataset: <a href="https://huggingface.co/datasets/alabnii/sciclaimeval-shared-task">huggingface.co/datasets/alabnii/sciclaimeval-shared-task</a>
- Formal Run Dataset: <i>will be released on March 01, 2026</i>
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

## Evaluation & Baselines

The evaluation script (in python) is available on github: [github.com/SciClaimEval/sciclaimeval-shared-task](https://github.com/SciClaimEval/sciclaimeval-shared-task).

All submissions will be evaluated on precision, recall, macro F1, and accuracy. In order to minimize the risk of model bias on subtask 1, the primary evaluation metric here is accuracy on claim pairs (a claim pair are two entries in the dataset with the same claim but opposing evidence labels). This stricter metric only counts correct results if both entries of a pair were correctly predicted (i.e., the supported claim and refuted claim of the same claim text were correctly identified).

<div class="evaluation-table">
  <table>
    <thead>
      <tr>
        <th>Subtask 1 Baselines</th>
        <th>Precision</th>
        <th>Recall</th>
        <th>Macro-F1</th>
        <th>Accuracy</th>
        <th>Pair Accuracy</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <th>o4-mini</th>
        <td>83.4</td>
        <td>82.3</td>
        <td>82.8</td>
        <td>82.2</td>
        <td>68.0</td>
      </tr>
      <tr>
        <th>Qwen3-VL-8B</th>
        <td>76.1</td>
        <td>67.3</td>
        <td>70.6</td>
        <td>66.8</td>
        <td>45.7</td>
      </tr>
      <tr>
        <th>InternVL3_5-38B</th>
        <td>72.1</td>
        <td>69.8</td>
        <td>69.6</td>
        <td>70.7</td>
        <td>42.9</td>
      </tr>
      <tr>
        <th>Llama-3.2-11B-Vision</th>
        <td>57.0</td>
        <td>52.7</td>
        <td>48.2</td>
        <td>54.6</td>
        <td>10.2</td>
      </tr>
    </tbody>
  </table>
</div>

<div class="evaluation-table">
  <table>
    <thead>
      <tr>
        <th>Subtask 2 Baselines</th>
        <th>Precision</th>
        <th>Recall</th>
        <th>Macro-F1</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <th>tba.</th>
        <td>-</td>
        <td>-</td>
        <td>-</td>
      </tr>
    </tbody>
  </table>
</div>

## News

- <a href="#registration-for-participation">Participation registration</a> for SciClaimEval is now available.
- The development dataset is now available on huggingface: <a href="https://huggingface.co/datasets/alabnii/sciclaimeval-shared-task">alabnii/sciclaimeval-shared-task</a>.

## Important Dates

| Date | Event |
| ---: | :--- |
| January 31, 2026 | Development Dataset Release |
| March 01, 2026 | Formal Run Dataset Release |
| **June 1, 2026** | **Registration Deadline for Participants** |
| **July 19, 2026** | **Formal Run Submission Deadline** |
| August 1, 2026 | Evaluation Results Return |
| September 1, 2026 | Submission Due for Participant's Papers |
| November 1, 2026 | Camera-ready participant paper due |
| December 8 - 10, 2026 | NTCIR-19 Conference |
| December 11, 2026 | Full Dataset Release |

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

## Contact

Please direct any questions or corrections regarding the task to: sciclaimeval (at) gmail.com

## Organizers

- [Akiko Aizawa](https://www-al.nii.ac.jp/en/home-2/) (National Institute of Informatics, Japan)
- [André Greiner-Petter](https://gipplab.uni-goettingen.de/team/dr-andre-greiner-petter/) (University of Göttingen, Germany)
- [Florian Boudin](https://boudinfl.github.io/) (Inria, France)
- [Xanh Ho](https://xanhho.github.io/) (National Institute of Informatics, Japan)
