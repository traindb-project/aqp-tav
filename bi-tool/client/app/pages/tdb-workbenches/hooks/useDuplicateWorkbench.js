// Updated by wgkim 2023-04-25 : query -> workbench 변경
import { noop, extend, pick } from "lodash";
import { useCallback, useState } from "react";
import url from "url";
import qs from "query-string";
import { Workbench } from "@/services/workbench";

function keepCurrentUrlParams(targetUrl) {
  const currentUrlParams = qs.parse(window.location.search);
  targetUrl = url.parse(targetUrl);
  const targetUrlParams = qs.parse(targetUrl.search);
  return url.format(
    extend(pick(targetUrl, ["protocol", "auth", "host", "pathname", "hash"]), {
      search: qs.stringify(extend(currentUrlParams, targetUrlParams)),
    })
  );
}

export default function useDuplicateWorkbench(workbench) {
  const [isDuplicating, setIsDuplicating] = useState(false);

  const duplicateWorkbench = useCallback(() => {
    // To prevent opening the same tab, name must be unique for each browser
    const tabName = `duplicatedWorkbenchTab/${Math.random().toString()}`;

    // We should open tab here because this moment is a part of user interaction;
    // later browser will block such attempts
    const tab = window.open("", tabName);

    setIsDuplicating(true);
    Workbench.fork({ id: workbench.id })
      .then(newWorkbench => {
        tab.location = keepCurrentUrlParams(newWorkbench.getUrl(true));
      })
      .finally(() => {
        setIsDuplicating(false);
      });
  }, [workbench.id]);

  return [isDuplicating, isDuplicating ? noop : duplicateWorkbench];
}
