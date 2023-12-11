// Updated by wgkim 2023-04-26 : query -> workbench 변경
import { filter, find, toString } from "lodash";
import { useState, useMemo, useEffect } from "react";
import DataSource from "@/services/data-source";

export default function useWorkbenchDataSources(workbench) {
  const [allDataSources, setAllDataSources] = useState([]);
  const [dataSourcesLoaded, setDataSourcesLoaded] = useState(false);
  const dataSources = useMemo(() => filter(allDataSources, ds => !ds.view_only || ds.id === workbench.data_source_id), [
    allDataSources,
    workbench.data_source_id,
  ]);
  const dataSource = useMemo(
    () => find(dataSources, ds => toString(ds.id) === toString(workbench.data_source_id)) || null,
    [workbench.data_source_id, dataSources]
  );

  useEffect(() => {
    let cancelDataSourceLoading = false;
    DataSource.query().then(data => {
      if (!cancelDataSourceLoading) {
        setDataSourcesLoaded(true);
        setAllDataSources(data);
      }
    });

    return () => {
      cancelDataSourceLoading = true;
    };
  }, []);

  return useMemo(() => ({ dataSourcesLoaded, dataSources, dataSource }), [dataSourcesLoaded, dataSources, dataSource]);
}
