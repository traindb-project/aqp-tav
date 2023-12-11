// Updated by wgkim 2023-04-26 : query -> workbench 변경
import { uniqueId } from "lodash";
import React from "react";
import PropTypes from "prop-types";
import Alert from "antd/lib/alert";
import Button from "antd/lib/button";
import Checkbox from "antd/lib/checkbox";
import Form from "antd/lib/form";
import InputNumber from "antd/lib/input-number";
import Modal from "antd/lib/modal";
import { wrap as wrapDialog, DialogPropType } from "@/components/DialogWrapper";
import { clientConfig } from "@/services/auth";
import CodeBlock from "@/components/CodeBlock";

import "./EmbedWorkbenchDialog.less";

class EmbedWorkbenchDialog extends React.Component {
  static propTypes = {
    dialog: DialogPropType.isRequired,
    workbench: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    visualization: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  };

  state = {
    enableChangeIframeSize: false,
    iframeWidth: 720,
    iframeHeight: 391,
  };

  constructor(props) {
    super(props);
    const { workbench, visualization } = props;
    this.embedUrl = `${clientConfig.basePath}embed/workbench/${workbench.id}/visualization/${visualization.id}?api_key=${
      workbench.api_key
    }&${workbench.getParameters().toUrlParams()}`;

    if (window.snapshotUrlBuilder) {
      this.snapshotUrl = window.snapshotUrlBuilder(workbench, visualization);
    }
  }

  urlEmbedLabelId = uniqueId("url-embed-label");
  iframeEmbedLabelId = uniqueId("iframe-embed-label");

  render() {
    const { workbench, dialog } = this.props;
    const { enableChangeIframeSize, iframeWidth, iframeHeight } = this.state;

    return (
      <Modal
        {...dialog.props}
        className="embed-workbench-dialog"
        title="Embed Workbench"
        footer={<Button onClick={dialog.dismiss}>Close</Button>}>
        {workbench.is_safe ? (
          <React.Fragment>
            <h5 id={this.urlEmbedLabelId} className="m-t-0">
              Public URL
            </h5>
            <div className="m-b-30">
              <CodeBlock aria-labelledby={this.urlEmbedLabelId} data-test="EmbedIframe" copyable>
                {this.embedUrl}
              </CodeBlock>
            </div>
            <h5 id={this.iframeEmbedLabelId} className="m-t-0">
              IFrame Embed
            </h5>
            <div>
              <CodeBlock aria-labelledby={this.iframeEmbedLabelId} copyable>
                {`<iframe src="${this.embedUrl}" width="${iframeWidth}" height="${iframeHeight}"></iframe>`}
              </CodeBlock>
              <Form className="m-t-10" layout="inline">
                <Form.Item>
                  <Checkbox
                    checked={enableChangeIframeSize}
                    onChange={e => this.setState({ enableChangeIframeSize: e.target.checked })}
                  />
                </Form.Item>
                <Form.Item label="Width">
                  <InputNumber
                    className="size-input"
                    value={iframeWidth}
                    onChange={value => this.setState({ iframeWidth: value })}
                    size="small"
                    disabled={!enableChangeIframeSize}
                  />
                </Form.Item>
                <Form.Item label="Height">
                  <InputNumber
                    className="size-input"
                    value={iframeHeight}
                    onChange={value => this.setState({ iframeHeight: value })}
                    size="small"
                    disabled={!enableChangeIframeSize}
                  />
                </Form.Item>
              </Form>
            </div>
            {this.snapshotUrl && (
              <React.Fragment>
                <h5>Image Embed</h5>
                <CodeBlock copyable>{this.snapshotUrl}</CodeBlock>
              </React.Fragment>
            )}
          </React.Fragment>
        ) : (
          <Alert
            message="Currently it is not possible to embed workbenches that contain text parameters."
            type="error"
            data-test="EmbedErrorAlert"
          />
        )}
      </Modal>
    );
  }
}

export default wrapDialog(EmbedWorkbenchDialog);
