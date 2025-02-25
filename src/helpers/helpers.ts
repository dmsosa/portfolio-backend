function slugify(string: string): string {
    return string.trim().toLowerCase().replace(/\W|_/g, "-");
};
export { slugify };