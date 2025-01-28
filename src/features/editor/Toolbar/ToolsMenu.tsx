import React from "react";
import { Menu, Flex } from "@mantine/core";
import { JSONSchemaFaker } from "json-schema-faker";
import toast from "react-hot-toast";
import { CgChevronDown } from "react-icons/cg";
import { FaRandom } from "react-icons/fa";
import { MdFilterListAlt } from "react-icons/md";
import { SiJsonwebtokens } from "react-icons/si";
import { VscSearchFuzzy, VscJson, VscGroupByRefType } from "react-icons/vsc";
import { jsonToContent } from "src/lib/utils/jsonAdapter";
import useFile from "src/store/useFile";
import useJson from "src/store/useJson";
import useModal from "src/store/useModal";
import { StyledToolElement } from "./styles";

export const ToolsMenu = () => {
  const setVisible = useModal(state => state.setVisible);
  const getJson = useJson(state => state.getJson);
  const setContents = useFile(state => state.setContents);
  const getFormat = useFile(state => state.getFormat);

  const randomizeData = async () => {
    try {
      // generate json schema
      const { run } = await import("json_typegen_wasm");
      const jsonSchema = run(
        "Root",
        getJson(),
        JSON.stringify({
          output_mode: "json_schema",
        })
      );

      // generate random data
      const randomJson = JSONSchemaFaker.generate(JSON.parse(jsonSchema));
      const contents = await jsonToContent(JSON.stringify(randomJson, null, 2), getFormat());
      setContents({ contents });
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate mock data");
    }
  };

  return (
    <Menu shadow="md" withArrow>
      <Menu.Target>
        <StyledToolElement>
          <Flex align="center" gap={3}>
            Tools <CgChevronDown />
          </Flex>
        </StyledToolElement>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item
          fz={12}
          leftSection={<VscSearchFuzzy />}
          onClick={() => {
            setVisible("JQModal", true);
          }}
        >
          JSON Query (jq)
        </Menu.Item>
        <Menu.Item
          fz={12}
          leftSection={<VscJson />}
          onClick={() => {
            setVisible("SchemaModal", true);
          }}
        >
          JSON Schema
        </Menu.Item>
        <Menu.Item
          fz={12}
          leftSection={<MdFilterListAlt />}
          onClick={() => {
            setVisible("JPathModal", true);
          }}
        >
          JSON Path
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item
          fz={12}
          leftSection={<SiJsonwebtokens />}
          onClick={() => {
            setVisible("JWTModal", true);
          }}
        >
          Decode JWT
        </Menu.Item>
        <Menu.Item
          fz={12}
          leftSection={<VscGroupByRefType />}
          onClick={() => {
            setVisible("TypeModal", true);
          }}
        >
          Generate Type
        </Menu.Item>
        <Menu.Item fz={12} leftSection={<FaRandom />} onClick={randomizeData}>
          Randomize Data
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};
