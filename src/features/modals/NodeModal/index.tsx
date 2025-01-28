import React, { useEffect, useRef, useState } from "react";
import type { ModalProps } from "@mantine/core";
import { Modal, Stack, Text, ScrollArea, Button, TextInput } from "@mantine/core";
import { CodeHighlight } from "@mantine/code-highlight";
import NodeEditor from "src/features/editor/NodeEditor";
import useGraph from "src/features/editor/views/GraphView/stores/useGraph";
import { contentToJson, jsonToContent } from "src/lib/utils/jsonAdapter";
import useFile from "src/store/useFile";

const dataToString = (data: any) => {
  const text = Array.isArray(data) ? Object.fromEntries(data) : data;
  const replacer = (_: string, v: string) => {
    if (typeof v === "string") return v.replaceAll('"', "");
    return v;
  };

  return JSON.stringify(text, replacer, 2);
};

export const NodeModal = ({ opened, onClose }: ModalProps) => {
  const [visible, setVisible] = useState(false);
  const contents = useFile(state => state.contents);
  const setContents = useFile(state => state.setContents);
  const nodeData = useGraph(state => state.selectedNode);
  const path = useGraph(state => state.selectedNode?.path || "");
  const fileType = useFile(state => state.format);
  const [nodeContent, setNodeContent] = useState<string>();
  const originalContent = useRef<string>("");

  const isNode = nodeData?.data.type === "array" || nodeData?.data.type === "object";

  useEffect(() => {
    const text = dataToString(nodeData?.text);

    setNodeContent(isNode ? text.replace(/"/g, "") : text);
    originalContent.current = text;
  }, [isNode, nodeData]);

  const handleNodeChange = (value?: string) => {
    setNodeContent(value || "");
  };

  const handleSave = async () => {
    const jsonContents = await contentToJson(contents, fileType);
    if (!nodeContent) return;

    const nodePath = path.replace("{Root}.", "");
    if (isNode) {
      jsonContents[nodeContent] = jsonContents[nodePath];
      delete jsonContents[nodePath];
    } else {
      jsonContents[nodePath] = JSON.parse(nodeContent);
    }
    const updatedContents = await jsonToContent(JSON.stringify(jsonContents, null, 2), fileType);

    setContents({ contents: updatedContents, format: fileType });
    setVisible(false);
  };

  const handleCancel = () => {
    setNodeContent(originalContent.current);
    setVisible(false);
  };

  return (
    <Modal title="Node Content" size="auto" opened={opened} onClose={onClose} centered>
      <Stack py="sm" gap="sm">
        <Stack gap="xs">
          <Text fz="xs" fw={500}>
            Content
          </Text>
          {visible ? (
            isNode ? (
              <TextInput value={nodeContent} onChange={e => handleNodeChange(e.target.value)} />
            ) : (
              <NodeEditor value={nodeContent} onChange={handleNodeChange} />
            )
          ) : (
            <ScrollArea.Autosize mah={250} maw={600}>
              {nodeContent && (
                <CodeHighlight
                  code={nodeContent}
                  miw={350}
                  maw={600}
                  language="json"
                  withCopyButton
                />
              )}
            </ScrollArea.Autosize>
          )}
        </Stack>

        {visible ? (
          <>
            <Button onClick={handleSave}>Save</Button>
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
          </>
        ) : (
          <Button
            onClick={() => {
              setVisible(true);
            }}
          >
            Edit
          </Button>
        )}

        <Text fz="xs" fw={500}>
          JSON Path
        </Text>
        <ScrollArea.Autosize maw={600}>
          <CodeHighlight
            code={path}
            miw={350}
            mah={250}
            language="json"
            copyLabel="Copy to clipboard"
            copiedLabel="Copied to clipboard"
            withCopyButton
          />
        </ScrollArea.Autosize>
      </Stack>
    </Modal>
  );
};
