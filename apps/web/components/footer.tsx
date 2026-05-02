export const Footer = () => {
  return (
    <footer className="border-border mt-auto w-full border-t">
      <div className="container py-4 text-center md:py-6">
        <p className="text-muted-foreground text-sm leading-relaxed">
          Made by{" "}
          <a
            href="https://github.com/devansh-365"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary font-medium underline underline-offset-4 transition-colors hover:text-primary/80"
          >
            Devansh
          </a>
        </p>
      </div>
    </footer>
  );
};
