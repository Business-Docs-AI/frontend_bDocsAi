import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { FileText, Search } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DocumentSheet } from '@/components/document/DocumentSheet';
import { DocumentViewerDialog } from '@/components/document/DocumentViewerDialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { documentsService } from '@/services/api/documentsService';
import type { Document } from '@/types';

const categoryColors: Record<string, { main: string; soft: string }> = {
  purple: { main: '#5B4FCF', soft: '#F0EEFF' },
  green: { main: '#1F8A4C', soft: '#EAF7EF' },
  blue: { main: '#1E63C9', soft: '#EAF2FF' },
  amber: { main: '#B4740E', soft: '#FFF5DF' },
  teal: { main: '#147D7A', soft: '#E7F7F5' },
};

/** Cores da categoria, com fallback na cor primaria da marca. */
function colorsOf(cor: string) {
  return categoryColors[cor] ?? { main: '#F0554A', soft: '#FDECEA' };
}

export function DocumentationPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Todas');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<{
    document: Document;
    categoryName: string;
  } | null>(null);

  useEffect(() => {
    let isMounted = true;

    documentsService.list()
      .then((data) => {
        if (isMounted) setDocuments(data);
      })
      .catch(() => {
        if (isMounted) setLoadError('Não foi possível carregar os documentos do backend.');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const categories = useMemo(
    () => [
      'Todas',
      ...Array.from(new Set(documents.map((document) => document.categoriaNome ?? `Categoria ${document.categoriaId ?? '—'}`))),
    ],
    [documents],
  );
  const totalDocuments = documents.length;
  const filteredCategories = useMemo(() => {
    const term = search.trim().toLowerCase();

    return Array.from(
      documents
        .filter((document) => {
          const categoryLabel = document.categoriaNome ?? `Categoria ${document.categoriaId ?? '—'}`;
          return category === 'Todas' || categoryLabel === category;
        })
        .filter((document) => document.titulo.toLowerCase().includes(term))
        .reduce((groups, document) => {
          const key = document.categoriaNome ?? `Categoria ${document.categoriaId ?? '—'}`;
          const group = groups.get(key) ?? { categoria: key, cor: ['purple', 'green', 'blue', 'amber', 'teal'][groups.size % 5], documentos: [] as Document[] };
          group.documentos.push(document);
          groups.set(key, group);
          return groups;
        }, new Map<string, { categoria: string; cor: string; documentos: Document[] }>()),
    ).map(([, group]) => group);
  }, [category, documents, search]);

  return (
    <div className="p-4 md:p-7">
      <PageHeader
        title="Documentação"
        subtitle="Encontre e navegue pelos documentos organizados por categoria."
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar documento..."
            className="h-10 pl-9"
          />
        </div>
        <Select
          value={category}
          onValueChange={(value) => setCategory(value ?? 'Todas')}
        >
          <SelectTrigger className="h-10 w-full sm:w-[190px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map((item) => (
              <SelectItem key={item} value={item}>
                {item === 'Todas' ? 'Todas as categorias' : item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-accent bg-accent p-3">
          <p className="text-body-sm text-muted-foreground">Documentos</p>
          <p className="mt-1 text-h2">{totalDocuments}</p>
        </div>
        <div
          className="rounded-lg border p-3"
          style={{
            backgroundColor: categoryColors.purple.soft,
            borderColor: categoryColors.purple.soft,
          }}
        >
          <p className="text-body-sm text-muted-foreground">Categorias</p>
          <p className="mt-1 text-h2">{categories.length - 1}</p>
        </div>
      </div>

      {isLoading && (
        <p className="py-10 text-center text-muted-foreground">Carregando documentos...</p>
      )}
      {loadError && (
        <p className="py-10 text-center text-destructive">{loadError}</p>
      )}

      <div className="flex flex-col gap-6 md:gap-8">
        {filteredCategories.map((categoria) => {
          const cores = colorsOf(categoria.cor);

          return (
            <section key={categoria.categoria}>
              <div className="mb-4 flex w-full items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <span
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: cores.main }}
                  />
                  <h2 className="text-[17px] font-bold">{categoria.categoria}</h2>
                </div>
                <Badge
                  className="shrink-0 font-bold"
                  style={{ color: cores.main, backgroundColor: cores.soft }}
                >
                  {categoria.documentos.length} documento
                  {categoria.documentos.length === 1 ? '' : 's'}
                </Badge>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 md:gap-5 lg:grid-cols-4">
                {categoria.documentos.map((documento) => (
                  <div
                    key={documento.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedDocument({ document: documento, categoryName: categoria.categoria })}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        setSelectedDocument({ document: documento, categoryName: categoria.categoria });
                      }
                    }}
                    style={{ '--cat': cores.main } as CSSProperties}
                    className="flex h-full cursor-pointer flex-col overflow-hidden rounded-xl border border-border bg-card outline-none transition-[transform,box-shadow,border-color] duration-150 hover:-translate-y-0.5 hover:border-[var(--cat)] hover:shadow-[0_8px_20px_rgba(34,31,28,0.1)] focus-visible:-translate-y-0.5 focus-visible:border-[var(--cat)] focus-visible:shadow-[0_8px_20px_rgba(34,31,28,0.1)]"
                  >
                    <div
                      className="flex h-24 shrink-0 items-center justify-center"
                      style={{ backgroundColor: cores.soft, color: cores.main }}
                    >
                      <FileText className="size-11 opacity-[0.72]" strokeWidth={1.5} />
                    </div>
                    <div className="flex flex-1 flex-col gap-1.5 p-3">
                      <p className="truncate text-[15px] font-bold">{documento.titulo}</p>
                      <div className="mt-auto flex items-center justify-between gap-2">
                        <span className="truncate text-xs text-muted-foreground">
                          v{documento.versaoAtual} · {documento.criadoPor ?? 'Autor não informado'}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto shrink-0 px-1 py-0.5 font-semibold text-primary"
                          onClick={(event) => {
                            event.stopPropagation();
                            setSelectedDocument({ document: documento, categoryName: categoria.categoria });
                          }}
                        >
                          Ver
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {filteredCategories.length === 0 && (
        <div className="py-14 text-center">
          <p className="text-[17px] font-bold">Nenhum documento encontrado</p>
          <p className="mt-1 text-muted-foreground">
            Tente alterar a busca ou o filtro selecionado.
          </p>
        </div>
      )}

      <DocumentViewerDialog
        open={selectedDocument !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedDocument(null);
        }}
        title={selectedDocument?.document.titulo ?? ''}
      >
        {selectedDocument && (
          <DocumentSheet
            document={selectedDocument.document}
            categoryName={selectedDocument.categoryName}
          />
        )}
      </DocumentViewerDialog>
    </div>
  );
}
