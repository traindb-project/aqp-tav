// Updated by wgkim 2023-04-26 : query -> workbench 변경
import { isNil, map, filter, some, includes, get } from "lodash";
import cx from "classnames";
import React, { useState, useCallback, useMemo, useEffect } from "react";
import PropTypes from "prop-types";
import { useDebouncedCallback } from "use-debounce";
import Input from "antd/lib/input";
import Button from "antd/lib/button";
import AutoSizer from "react-virtualized/dist/commonjs/AutoSizer";
import List from "react-virtualized/dist/commonjs/List";
import PlainButton from "@/components/PlainButton";
import Tooltip from "@/components/Tooltip";
import useDataSourceSchema from "@/pages/tdb-workbenches/hooks/useDataSourceSchema";
import useImmutableCallback from "@/lib/hooks/useImmutableCallback";
import LoadingState from "../items-list/components/LoadingState";

// Updated by wgkim 2023-04-27 : 체크박스 추가
import Checkbox from "antd/lib/checkbox";

const SchemaItemColumnType = PropTypes.shape({
  name: PropTypes.string.isRequired,
  type: PropTypes.string,
});

export const SchemaItemType = PropTypes.shape({
  name: PropTypes.string.isRequired,
  size: PropTypes.number,
  loading: PropTypes.bool,
  columns: PropTypes.arrayOf(SchemaItemColumnType).isRequired,
});

// Updated by wgkim 2023-04-27 : 체크박스 크기때문에 사이즈 변경
// const schemaTableHeight = 22;
// const schemaColumnHeight = 18;
const schemaTableHeight = 26;
const schemaColumnHeight = 22;

function SchemaItem({ 
  item, expanded, onToggle, onSelect, 
  targetTable, setTargetTable, targetColumns, setTargetColumns,
  ...props 
}) {
  const handleSelect = useCallback(
    (event, ...args) => {
      event.preventDefault();
      event.stopPropagation();
      onSelect(...args);
    },
    [onSelect]
  );

  if (!item) {
    return null;
  }

  const tableDisplayName = item.displayName || item.name;

  return (
    <div {...props}>
      <div className="schema-list-item">
        {/* Updated by wgkim 2023-04-27 : 아이콘 순서 변겅 및 클릭이벤트 공통화*/}
        <Tooltip key={item.name} title="Show the data with the choosed table">
          <PlainButton className="workbench-copy-to-editor" onClick={e => {
            onToggle(e)
            // handleSelect(e, item.name, item.columns)
            handleSelect(e, item)
          }}>
            {
              expanded ? 
              <i className="fa fa-angle-double-down" aria-hidden="false" />: 
              <i className="fa fa-angle-double-right" aria-hidden="false" />
            }
          </PlainButton>
        </Tooltip>
        <PlainButton className="table-name" onClick={e => {
          onToggle(e)
          // handleSelect(e, item.name, item.columns.name)
          setTargetTable(item.name)
          setTargetColumns([])
          handleSelect(e, item)
        }}>
          <i className="fa fa-table m-r-5" aria-hidden="true" />
          <strong>
            <span title={item.name}>{tableDisplayName}</span>
            {!isNil(item.size) && <span> ({item.size})</span>}
          </strong>
        </PlainButton>
        {/* TODO : 각 테이블당 행의 개수*/}
      </div>
      {expanded && (
        <div className="table-open">
          {item.loading ? (
            <div className="table-open">Loading...</div>
          ) : (
            map(item.columns, column => {
              const columnName = get(column, "name");
              const columnType = get(column, "type");
              return (
                <Tooltip 
                  key={columnName}
                  title="Include or exclude column name on the table"
                  mouseEnterDelay={0}
                  mouseLeaveDelay={0}
                  placement="rightTop">
                  {/* Updated by wgkim 2023-04-27 : 체크박스 추가 및 컬럼클릭 기능 변경 */}
                  <PlainButton key={columnName} className="table-open-item" onClick={e => {
                    if(columnType!=='character varying' && !targetColumns.includes(columnName)){
                      setTargetColumns([...targetColumns, columnName])
                    }
                    
                    // handleSelect(e, columnName)
                    // isChecked = !isChecked
                  }}>
                    {/* <Checkbox className="query-editor-controls-checkbox" defaultChecked>  </Checkbox> */}
                      <div>
                        {columnName} {columnType && <span className="column-type">{columnType}</span>}
                      </div>
                  </PlainButton>
                </Tooltip>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

SchemaItem.propTypes = {
  item: SchemaItemType,
  expanded: PropTypes.bool,
  onToggle: PropTypes.func,
  onSelect: PropTypes.func,
};

SchemaItem.defaultProps = {
  item: null,
  expanded: false,
  onToggle: () => {},
  onSelect: () => {},
};

function SchemaLoadingState() {
  return (
    <div className="schema-loading-state">
      <LoadingState className="" />
    </div>
  );
}

export function SchemaList({ 
  loading, schema, expandedFlags, onTableExpand, onItemSelect, 
  targetTable, setTargetTable, targetColumns, setTargetColumns,
  props 
}) {
  const [listRef, setListRef] = useState(null);

  useEffect(() => {
    if (listRef) {
      listRef.recomputeRowHeights();
    }
  }, [listRef, schema, expandedFlags]);

  return (
    <div className="schema-browser">
      {loading && <SchemaLoadingState />}
      {!loading && (
        <AutoSizer>
          {({ width, height }) => (
            <List
              ref={setListRef}
              width={width}
              // Updated by wgkim : 자리 안맞음 수정
              height={height + 8}
              rowCount={schema.length}
              rowHeight={({ index }) => {
                const item = schema[index];
                const columnsLength = !item.loading ? item.columns.length : 1;
                let columnCount = expandedFlags[item.name] ? columnsLength : 0;
                return schemaTableHeight + schemaColumnHeight * columnCount;
              }}
              rowRenderer={({ key, index, style }) => {
                const item = schema[index];
                return (
                  <SchemaItem
                    key={key}
                    style={style}
                    item={item}
                    expanded={expandedFlags[item.name]}
                    onToggle={() => onTableExpand(item.name)}
                    onSelect={onItemSelect}

                    targetTable={targetTable}
                    setTargetTable={setTargetTable}
                    targetColumns={targetColumns}
                    setTargetColumns={setTargetColumns}

                    props={props}
                  />
                );
              }}
            />
          )}
        </AutoSizer>
      )}
    </div>
  );
}

export function applyFilterOnSchema(schema, filterString) {
  const filters = filter(filterString.toLowerCase().split(/\s+/), s => s.length > 0);

  // Empty string: return original schema
  if (filters.length === 0) {
    return schema;
  }

  // Single word: matches table or column
  if (filters.length === 1) {
    const nameFilter = filters[0];
    const columnFilter = filters[0];
    return filter(
      schema,
      item =>
        includes(item.name.toLowerCase(), nameFilter) ||
        some(item.columns, column => includes(get(column, "name").toLowerCase(), columnFilter))
    );
  }

  // Two (or more) words: first matches table, seconds matches column
  const nameFilter = filters[0];
  const columnFilter = filters[1];
  return filter(
    map(schema, item => {
      if (includes(item.name.toLowerCase(), nameFilter)) {
        item = {
          ...item,
          columns: filter(item.columns, column => includes(get(column, "name").toLowerCase(), columnFilter)),
        };
        return item.columns.length > 0 ? item : null;
      }
    })
  );
}

export default function SchemaBrowser({
  dataSource,
  onSchemaUpdate,
  onItemSelect,
  options,
  onOptionsUpdate,

  targetTable,
  setTargetTable,
  targetColumns,
  setTargetColumns,

  ...props
}) {
  const [schema, isLoading, refreshSchema] = useDataSourceSchema(dataSource);
  const [filterString, setFilterString] = useState("");
  const filteredSchema = useMemo(() => applyFilterOnSchema(schema, filterString), [schema, filterString]);
  const [handleFilterChange] = useDebouncedCallback(setFilterString, 500);
  const [expandedFlags, setExpandedFlags] = useState({});
  // const [isChecked, setIsChecked] = useState()

  const handleSchemaUpdate = useImmutableCallback(onSchemaUpdate);

  useEffect(() => {
    setExpandedFlags({});
    handleSchemaUpdate(schema);
  }, [schema, handleSchemaUpdate]);

  if (schema.length === 0 && !isLoading) {
    return null;
  }

  function toggleTable(tableName) {
    // Updated by wgkim 2023-04-27 : 테이블 하나만 펼쳐놓기
    setExpandedFlags({
      [tableName]: !expandedFlags[tableName],
    });
  }

  return (
    <div className="schema-container" {...props}>
      <div className="schema-control">
        <Input
          className="m-r-5"
          placeholder="Search schema..."
          aria-label="Search schema"
          disabled={schema.length === 0}
          onChange={event => handleFilterChange(event.target.value)}
        />

        <Tooltip title="Refresh Schema">
          <Button onClick={() => refreshSchema(true)}>
            <i className={cx("zmdi zmdi-refresh", { "zmdi-hc-spin": isLoading })} aria-hidden="true" />
            <span className="sr-only">{isLoading ? "Loading, please wait." : "Press to refresh."}</span>
          </Button>
        </Tooltip>
      </div>
      <SchemaList
        loading={isLoading && schema.length === 0}
        schema={filteredSchema}
        expandedFlags={expandedFlags}
        onTableExpand={toggleTable}
        onItemSelect={onItemSelect}

        targetTable={targetTable}
        setTargetTable={setTargetTable}
        targetColumns={targetColumns}
        setTargetColumns={setTargetColumns}

        props={props}
      />
    </div>
  );
}

SchemaBrowser.propTypes = {
  dataSource: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  onSchemaUpdate: PropTypes.func,
  onItemSelect: PropTypes.func,
};

SchemaBrowser.defaultProps = {
  dataSource: null,
  onSchemaUpdate: () => {},
  onItemSelect: () => {},
};
