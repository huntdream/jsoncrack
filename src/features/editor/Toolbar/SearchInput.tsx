import React from "react";
import { CloseButton, Flex, Text, TextInput } from "@mantine/core";
import { getHotkeyHandler } from "@mantine/hooks";
import { AiOutlineSearch } from "react-icons/ai";
import { useFocusNode } from "src/hooks/useFocusNode";

export const SearchInput = () => {
  const [searchValue, setValue, skip, nodeCount, currentNode] = useFocusNode();

  return (
    <TextInput
      type="search"
      size="xs"
      id="search-node"
      w={180}
      value={searchValue}
      onChange={e => setValue(e.currentTarget.value)}
      placeholder="Search Node"
      autoComplete="off"
      autoCorrect="off"
      onKeyDown={getHotkeyHandler([["Enter", skip]])}
      leftSection={<AiOutlineSearch />}
      rightSection={
        searchValue && (
          <Flex h={30} align="center">
            <Text size="xs" c="dimmed">
              {searchValue && `${nodeCount}/${nodeCount > 0 ? currentNode + 1 : "0"}`}
            </Text>
            <CloseButton
              size="sm"
              radius="lg"
              mr="20px"
              aria-label="Clear input"
              onClick={() => setValue("")}
              style={{ display: searchValue ? undefined : "none" }}
            />
          </Flex>
        )
      }
    />
  );
};
