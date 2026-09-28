import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import SearchIcon from '@mui/icons-material/Search';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useEffect, useMemo, useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { documentsService } from '@/services/api/documentsService';
import type { Document } from '@/types';

const categoryColors: Record<string, { main: string; soft: string }> = {
  purple: { main: '#5B4FCF', soft: '#F0EEFF' },
  green: { main: '#1F8A4C', soft: '#EAF7EF' },
  blue: { main: '#1E63C9', soft: '#EAF2FF' },
  amber: { main: '#B4740E', soft: '#FFF5DF' },
  teal: { main: '#147D7A', soft: '#E7F7F5' },
};

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
    () => ['Todas', ...Array.from(new Set(documents.map((document) => String(document.categoryId))))],
    [documents],
  );
  const totalDocuments = documents.length;
  const filteredCategories = useMemo(() => {
    const term = search.trim().toLowerCase();

    return Array.from(
      documents
        .filter((document) => category === 'Todas' || String(document.categoryId) === category)
        .filter((document) => document.title.toLowerCase().includes(term))
        .reduce((groups, document) => {
          const key = String(document.categoryId);
          const group = groups.get(key) ?? { categoria: `Categoria ${key}`, cor: ['purple', 'green', 'blue', 'amber', 'teal'][groups.size % 5], documentos: [] as Document[] };
          group.documentos.push(document);
          groups.set(key, group);
          return groups;
        }, new Map<string, { categoria: string; cor: string; documentos: Document[] }>()),
    ).map(([, group]) => group);
  }, [category, documents, search]);

  return (
    <Box sx={{ p: { xs: 2, md: 3.5 }, maxWidth: 1280, mx: 'auto' }}>
      <PageHeader
        title="Documentation"
        subtitle="Find and browse documents organized by category."
      />
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 3 }}>
        <TextField
          fullWidth
          size="small"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar documento..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
          }}
        />
        <Select
          size="small"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          sx={{ minWidth: { sm: 190 } }}
        >
          {categories.map((item) => (
            <MenuItem key={item} value={item}>
              {item === 'Todas' ? 'Todas as categorias' : item}
            </MenuItem>
          ))}
        </Select>
      </Stack>
      <Grid container spacing={1.5} sx={{ mb: 3 }}>
        <Grid xs={6} sm={3}>
          <Card variant="outlined" sx={{ backgroundColor: 'primary.light', borderColor: 'primary.light' }}>
            <CardContent sx={{ '&:last-child': { pb: 1.5 }, p: 1.5 }}>
              <Typography variant="body2" color="text.secondary">Documentos</Typography>
              <Typography variant="h2" sx={{ mt: 0.5 }}>{totalDocuments}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid xs={6} sm={3}>
          <Card variant="outlined" sx={{ backgroundColor: '#F0EEFF', borderColor: '#F0EEFF' }}>
            <CardContent sx={{ '&:last-child': { pb: 1.5 }, p: 1.5 }}>
              <Typography variant="body2" color="text.secondary">Categorias</Typography>
              <Typography variant="h2" sx={{ mt: 0.5 }}>{categories.length - 1}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      {isLoading && (
        <Typography color="text.secondary" sx={{ py: 5, textAlign: 'center' }}>
          Carregando documentos...
        </Typography>
      )}
      {loadError && (
        <Typography color="error" sx={{ py: 5, textAlign: 'center' }}>
          {loadError}
        </Typography>
      )}
      <Stack spacing={{ xs: 3, md: 4 }}>
        {filteredCategories.map((categoria) => (
          <Box
            key={categoria.categoria}
            sx={{
              display: 'block',
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ width: '100%', mb: 3.50, gap: 2 }}
            >
              <Stack direction="row" alignItems="center" spacing={1.25}>
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    flexShrink: 0,
                    borderRadius: '50%',
                    backgroundColor: categoryColors[categoria.cor]?.main ?? 'primary.main',
                  }}
                />
                <Typography variant="h6" sx={{ fontSize: 17, fontWeight: 700 }}>
                  {categoria.categoria}
                </Typography>
              </Stack>
              <Chip
                size="small"
                label={`${categoria.documentos.length} documento${categoria.documentos.length === 1 ? '' : 's'}`}
                sx={{
                  flexShrink: 0,
                  color: categoryColors[categoria.cor]?.main ?? 'primary.main',
                  backgroundColor: categoryColors[categoria.cor]?.soft ?? 'primary.light',
                  fontWeight: 700,
                }}
              />
            </Stack>
            <Grid container spacing={{ xs: 2, md: 2.5 }}>
              {categoria.documentos.map((documento) => (
                  <Grid key={documento.id} xs={12} sm={6} md={4} lg={3}>
                  <Card
                    variant="outlined"
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedDocument({ document: documento, categoryName: categoria.categoria })}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        setSelectedDocument({ document: documento, categoryName: categoria.categoria });
                      }
                    }}
                    sx={{
                      height: '100%',
                      borderColor: 'divider',
                      borderRadius: 2,
                      overflow: 'hidden',
                      cursor: 'pointer',
                      transition: 'transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease',
                      '&:hover, &:focus-visible': {
                        borderColor: categoryColors[categoria.cor]?.main ?? 'primary.main',
                        boxShadow: '0 8px 20px rgba(34, 31, 28, 0.1)',
                        transform: 'translateY(-2px)',
                        outline: 'none',
                      },
                    }}
                  >
                    <Box
                      sx={{
                        height: 150,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: categoryColors[categoria.cor]?.soft ?? 'primary.light',
                        color: categoryColors[categoria.cor]?.main ?? 'primary.main',
                      }}
                    >
                      <DescriptionOutlinedIcon sx={{ fontSize: 70, opacity: 0.72 }} />
                    </Box>
                    <CardContent sx={{ display: 'flex', minHeight: 142, flexDirection: 'column', gap: 1, p: 1.75 }}>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontSize: 15,
                          fontWeight: 700,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {documento.title}
                      </Typography>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 'auto' }}>
                        <Typography variant="caption" color="text.secondary">
                          ID {documento.id} · {documento.createdBy ?? 'Autor não informado'}
                        </Typography>
                        <Button size="small" sx={{ minWidth: 'auto', px: 1 }} onClick={(event) => {
                          event.stopPropagation();
                          setSelectedDocument({ document: documento, categoryName: categoria.categoria });
                        }}>
                          Ver
                        </Button>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        ))}
      </Stack>
      {filteredCategories.length === 0 && (
        <Box sx={{ py: 7, textAlign: 'center' }}>
          <Typography variant="h6">Nenhum documento encontrado</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            Tente alterar a busca ou o filtro selecionado.
          </Typography>
        </Box>
      )}
      <Dialog
        open={selectedDocument !== null}
        onClose={() => setSelectedDocument(null)}
        fullWidth
        maxWidth="sm"
      >
        {selectedDocument && (
          <>
            <DialogTitle>{selectedDocument.document.title}</DialogTitle>
            <DialogContent dividers>
              <Stack spacing={1.5}>
                <Typography color="text.secondary">
                  Documento da categoria {selectedDocument.categoryName}.
                </Typography>
                <Typography sx={{ whiteSpace: 'pre-wrap' }}>
                  {selectedDocument.document.content || 'Este documento não possui conteúdo.'}
                </Typography>
                <Stack direction="row" spacing={1}>
                  <Chip label={`ID ${selectedDocument.document.id}`} />
                  <Chip variant="outlined" label={selectedDocument.document.createdBy ?? 'Autor não informado'} />
                </Stack>
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedDocument(null)}>Fechar</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}
