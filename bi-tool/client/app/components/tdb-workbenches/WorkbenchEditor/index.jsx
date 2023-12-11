// Updated by wgkim 2023-04-25 : query -> workbench 변경
import React, { useEffect, useMemo, useState, useCallback, useImperativeHandle } from "react";
import PropTypes from "prop-types";
import cx from "classnames";
import { AceEditor, snippetsModule, updateSchemaCompleter } from "./ace";
import { srNotify } from "@/lib/accessibility";
import { SchemaItemType } from "@/components/tdb-workbenches/SchemaBrowser";
import resizeObserver from "@/services/resizeObserver";
import WorkbenchSnippet from "@/services/workbench-snippet";

import WorkbenchEditorControls from "./WorkbenchEditorControls";
import "./index.less";

const editorProps = { $blockScrolling: Infinity };

const WorkbenchEditor = React.forwardRef(function(
  { className, syntax, value, autocompleteEnabled, schema, onChange, onSelectionChange, ...props },
  ref
) {
  const [container, setContainer] = useState(null);
  const [editorRef, setEditorRef] = useState(null);

  // For some reason, value for AceEditor should be managed in this way - otherwise it goes berserk when selecting text
  const [currentValue, setCurrentValue] = useState(value);

  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  const handleChange = useCallback(
    str => {
      setCurrentValue(str);
      onChange(str);
    },
    [onChange]
  );

  const editorOptions = useMemo(
    () => ({
      behavioursEnabled: true,
      enableSnippets: true,
      enableBasicAutocompletion: true,
      enableLiveAutocompletion: autocompleteEnabled,
      autoScrollEditorIntoView: true,
    }),
    [autocompleteEnabled]
  );

  useEffect(() => {
    if (editorRef) {
      const editorId = editorRef.editor.id;
      updateSchemaCompleter(editorId, schema);
      return () => {
        updateSchemaCompleter(editorId, null);
      };
    }
  }, [schema, editorRef]);

  useEffect(() => {
    function resize() {
      if (editorRef) {
        editorRef.editor.resize();
      }
    }

    if (container) {
      resize();
      const unwatch = resizeObserver(container, resize);
      return unwatch;
    }
  }, [container, editorRef]);

  const handleSelectionChange = useCallback(
    selection => {
      const rawSelectedWorkbenchText = editorRef.editor.session.doc.getTextRange(selection.getRange());
      const selectedWorkbenchText = rawSelectedWorkbenchText.length > 1 ? rawSelectedWorkbenchText : null;
      onSelectionChange(selectedWorkbenchText);
    },
    [editorRef, onSelectionChange]
  );

  const initEditor = useCallback(editor => {
    // Release Cmd/Ctrl+L to the browser
    editor.commands.bindKey({ win: "Ctrl+L", mac: "Cmd+L" }, null);

    // Release Cmd/Ctrl+Shift+F for format workbench action
    editor.commands.bindKey({ win: "Ctrl+Shift+F", mac: "Cmd+Shift+F" }, null);

    // Release Ctrl+P for open new parameter dialog
    editor.commands.bindKey({ win: "Ctrl+P", mac: null }, null);
    // Lineup only mac
    editor.commands.bindKey({ win: null, mac: "Ctrl+P" }, "golineup");

    // Esc for exiting
    editor.commands.bindKey({ win: "Esc", mac: "Esc" }, () => {
      editor.blur();
    });

    let notificationCleanup = null;
    editor.on("focus", () => {
      notificationCleanup = srNotify({
        text: "You've entered the SQL editor. To exit press the ESC key.",
        politeness: "assertive",
      });
    });

    editor.on("blur", () => {
      if (notificationCleanup) {
        notificationCleanup();
      }
    });

    // Reset Completer in case dot is pressed
    editor.commands.on("afterExec", e => {
      if (e.command.name === "insertstring" && e.args === "." && editor.completer) {
        editor.completer.showPopup(editor);
      }
    });

    WorkbenchSnippet.workbench().then(snippets => {
      const snippetManager = snippetsModule.snippetManager;
      const m = {
        snippetText: "",
      };
      m.snippets = snippetManager.parseSnippetFile(m.snippetText);
      snippets.forEach(snippet => {
        m.snippets.push(snippet.getSnippet());
      });
      snippetManager.register(m.snippets || [], m.scope);
    });

    editor.focus();
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      paste: (item) => {
        if (editorRef) {
          // Added by wgkim 2023-04-27 : 테이블 클릭시 select * from <테이블명> 이 되도록 변경
          // Updated by wgkim 2023-05-02 : 컬럼 정보를 받아오도록 변경

          const { editor } = editorRef;
          let tableName = item.name;
          // let columnString;
          // if (Array.isArray(item.columns)){
          //   const columnNames = item.columns.map(each => each.name)
          //   columnString = columnNames.join(', ')
          // }
          if (editor.session.doc){
            editor.session.doc.$lines[0] = ''
          }

          // let auto_text = 'select ' + columnString + ' from ' + tableName
          let auto_text = 'select * from ' + tableName
          editor.session.doc.replace(editor.selection.getRange(), auto_text);
          
          const range = editor.selection.getRange();
          onChange(editor.session.getValue());
          editor.selection.setRange(range);

          return auto_text
        }
      },
      focus: () => {
        if (editorRef) {
          editorRef.editor.focus();
        }
      },
    }),
    [editorRef, onChange]
  );

  // Updated by wgkim 2023-09-01 : 근사질의 키워드 추가 작업 진행
  return (
    <div className={cx("workbench-editor-container", className)} {...props} ref={setContainer}>
      <AceEditor
        ref={setEditorRef}
        theme="textmate"
        mode={syntax || "sql"}
        value={currentValue}
        editorProps={editorProps}
        width="100%"
        height="100%"
        setOptions={editorOptions}
        showPrintMargin={false}
        wrapEnabled={false}
        onLoad={initEditor}
        onChange={handleChange}
        onSelectionChange={handleSelectionChange}
      />
    </div>
  );
});

WorkbenchEditor.propTypes = {
  className: PropTypes.string,
  syntax: PropTypes.string,
  value: PropTypes.string,
  autocompleteEnabled: PropTypes.bool,
  schema: PropTypes.arrayOf(SchemaItemType),
  onChange: PropTypes.func,
  onSelectionChange: PropTypes.func,
};

WorkbenchEditor.defaultProps = {
  className: null,
  syntax: null,
  value: null,
  autocompleteEnabled: true,
  schema: [],
  onChange: () => {},
  onSelectionChange: () => {},
};

WorkbenchEditor.Controls = WorkbenchEditorControls;

export default WorkbenchEditor;
