export function JsonPre({ data }: { data: unknown }) {
  if (!data)
    return <div className="text-xs text-muted-foreground italic">No data</div>;
  return (
    <pre className="text-[10px] bg-muted p-4 rounded-md overflow-auto max-h-40 font-mono border border-border text-foreground">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}

