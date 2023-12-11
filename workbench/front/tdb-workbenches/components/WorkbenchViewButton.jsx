// Updated by wgkim 2023-04-25 : query -> workbench 변경
import React, { useState, useMemo, useEffect } from "react";
import PropTypes from "prop-types";
import Button from "antd/lib/button";
import KeyboardShortcuts from "@/services/KeyboardShortcuts";
import { ButtonTooltip } from "@/components/tdb-workbenches/WorkbenchEditor/WorkbenchEditorControls";

export default function WorkbenchViewButton({ title, shortcut, disabled, children, onClick, ...props }) {
  const [tooltipVisible, setTooltipVisible] = useState(false);

  const eventHandlers = useMemo(
    () => ({
      onMouseEnter: () => setTooltipVisible(true),
      onMouseLeave: () => setTooltipVisible(false),
    }),
    []
  );

  useEffect(() => {
    if (disabled) {
      setTooltipVisible(false);
    }
  }, [disabled]);

  useEffect(() => {
    if (shortcut) {
      const shortcuts = {
        [shortcut]: onClick,
      };

      KeyboardShortcuts.bind(shortcuts);
      return () => {
        KeyboardShortcuts.unbind(shortcuts);
      };
    }
  }, [shortcut, onClick]);

  return (
    <ButtonTooltip title={title} shortcut={shortcut} visible={tooltipVisible}>
      <span {...eventHandlers}>
        <Button
          data-test="ExecuteButton"
          disabled={disabled}
          onClick={onClick}
          style={disabled ? { pointerEvents: "none" } : {}}
          {...props}>
          {children}
        </Button>
      </span>
    </ButtonTooltip>
  );
}

WorkbenchViewButton.propTypes = {
  className: PropTypes.string,
  shortcut: PropTypes.string,
  disabled: PropTypes.bool,
  children: PropTypes.node,
  onClick: PropTypes.func,
};

WorkbenchViewButton.defaultProps = {
  className: null,
  shortcut: null,
  disabled: false,
  children: null,
  onClick: () => {},
};
