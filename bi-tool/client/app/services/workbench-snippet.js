// Updated by wgkim 2023-04-25 : query -> workbench 변경
import { axios } from "@/services/axios";
import { extend, map } from "lodash";

class WorkbenchSnippet {
  constructor(workbenchSnippet) {
    extend(this, workbenchSnippet);
  }

  getSnippet() {
    let name = this.trigger;
    if (this.description !== "") {
      name = `${this.trigger}: ${this.description}`;
    }

    return {
      name,
      content: this.snippet,
      tabTrigger: this.trigger,
    };
  }
}

const getWorkbenchSnippet = workbenchSnippet => new WorkbenchSnippet(workbenchSnippet);

const WorkbenchSnippetService = {
  get: data => axios.get(`api/workbench_snippets/${data.id}`).then(getWorkbenchSnippet),
  workbench: () => axios.get("api/workbench_snippets").then(data => map(data, getWorkbenchSnippet)),
  create: data => axios.post("api/workbench_snippets", data).then(getWorkbenchSnippet),
  save: data => axios.post(`api/workbench_snippets/${data.id}`, data).then(getWorkbenchSnippet),
  delete: data => axios.delete(`api/workbench_snippets/${data.id}`),
};

export default WorkbenchSnippetService;
