import React from "react";
import {
    AccordionItem,
    AccordionHeader,
    AccordionPanel,
    Alert,
    Box,
    ButtonGroup,
    css,
    Flex,
    Text,
    useTheme,
    useColorMode
} from "@chakra-ui/core";
import styled from "@emotion/styled";
import useAxios from "axios-hooks";
import strReplace from "react-string-replace";
import useConfig from "~/components/HyperglassProvider";
import CopyButton from "~/components/CopyButton";
import RequeryButton from "~/components/RequeryButton";
import ResultHeader from "~/components/ResultHeader";

const FormattedError = ({ keywords, message }) => {
    const patternStr = `(${keywords.join("|")})`;
    const pattern = new RegExp(patternStr, "gi");
    const errorFmt = strReplace(message, pattern, match => (
        <Text key={match} as="strong">
            {match}
        </Text>
    ));
    return <Text>{errorFmt}</Text>;
};

const AccordionHeaderWrapper = styled(Flex)`
    justify-content: space-between;
    &:hover {
        background-color: ${props => props.hoverBg};
    }
    &:focus {
        box-shadow: "outline";
    }
`;

const Result = React.forwardRef(
    ({ device, timeout, queryLocation, queryType, queryVrf, queryTarget }, ref) => {
        const config = useConfig();
        const theme = useTheme();
        const { colorMode } = useColorMode();
        const bg = { dark: theme.colors.gray[800], light: theme.colors.blackAlpha[100] };
        const color = { dark: theme.colors.white, light: theme.colors.black };
        const selectionBg = { dark: theme.colors.white, light: theme.colors.black };
        const selectionColor = { dark: theme.colors.black, light: theme.colors.white };
        const [{ data, loading, error }, refetch] = useAxios({
            url: "/api/query",
            method: "post",
            data: {
                query_location: queryLocation,
                query_type: queryType,
                query_vrf: queryVrf,
                query_target: queryTarget
            },
            timeout: timeout
        });
        const cleanOutput =
            data &&
            data.output
                .split("\\n")
                .join("\n")
                .replace(/\n\n/g, "");

        const errorKw = (error && error.response?.data?.keywords) || [];
        const errorMsg =
            (error && error.response?.data?.output) ||
            (error && error.message) ||
            config.messages.general;
        return (
            <AccordionItem
                isDisabled={loading}
                ref={ref}
                css={css({
                    "&:last-of-type": { borderBottom: "none" },
                    "&:first-of-type": { borderTop: "none" }
                })}
            >
                <AccordionHeaderWrapper hoverBg={theme.colors.blackAlpha[50]}>
                    <AccordionHeader flex="1 0 auto" py={2} _hover={{}} _focus={{}} w="unset">
                        <ResultHeader title={device.display_name} loading={loading} error={error} />
                    </AccordionHeader>
                    <ButtonGroup px={3} py={2}>
                        <CopyButton copyValue={cleanOutput} variant="ghost" />
                        <RequeryButton requery={refetch} variant="ghost" />
                    </ButtonGroup>
                </AccordionHeaderWrapper>
                <AccordionPanel
                    pb={4}
                    overflowX="auto"
                    css={css({ WebkitOverflowScrolling: "touch" })}
                >
                    <Flex direction="row" flexWrap="wrap">
                        <Flex direction="column" flex="1 0 auto">
                            {data && (
                                <Box
                                    fontFamily="mono"
                                    mt={5}
                                    mx={2}
                                    p={3}
                                    border="1px"
                                    borderColor="inherit"
                                    rounded="md"
                                    bg={bg[colorMode]}
                                    color={color[colorMode]}
                                    fontSize="sm"
                                    whiteSpace="pre-wrap"
                                    as="pre"
                                    css={css({
                                        "&::selection": {
                                            backgroundColor: selectionBg[colorMode],
                                            color: selectionColor[colorMode]
                                        }
                                    })}
                                >
                                    {cleanOutput}
                                </Box>
                            )}
                            {error && (
                                <Alert
                                    rounded="lg"
                                    my={2}
                                    py={4}
                                    status={error.response?.data?.alert || "error"}
                                >
                                    <FormattedError keywords={errorKw} message={errorMsg} />
                                </Alert>
                            )}
                        </Flex>
                    </Flex>
                </AccordionPanel>
            </AccordionItem>
        );
    }
);

Result.displayName = "HyperglassQueryResult";
export default Result;
