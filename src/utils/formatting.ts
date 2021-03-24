export const tokenize = (content: string) => {
    return content.split(" ").slice(1).join(" ")
}