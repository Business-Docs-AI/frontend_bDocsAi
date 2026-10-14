import { ChevronDown } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { Category, UserRole } from '@/types';

export interface UserFormData {
  name: string;
  email: string;
  password: string;
  role: UserRole | undefined;
  categoriaIds: number[];
}

export interface UserFormErrors {
  name?: string;
  email?: string;
  password?: string;
  role?: string;
}

const ROLE_OPTIONS: Array<{ value: UserRole; label: string }> = [
  { value: 'ADMIN', label: 'Administrador' },
  { value: 'EDITOR', label: 'Editor' },
  { value: 'USUARIO', label: 'Usuário' },
];

interface UserFormProps {
  value: UserFormData;
  errors: UserFormErrors;
  isEditing: boolean;
  categories: Category[];
  disabled: boolean;
  onChange: (data: UserFormData) => void;
  onFieldChange: (field: keyof UserFormErrors) => void;
}

export function UserForm({
  value,
  errors,
  isEditing,
  categories,
  disabled,
  onChange,
  onFieldChange,
}: UserFormProps) {
  function handleChange<K extends keyof UserFormData>(
    field: K,
    fieldValue: UserFormData[K],
  ) {
    onChange({ ...value, [field]: fieldValue });
    onFieldChange(field as keyof UserFormErrors);
  }

  function toggleCategory(categoryId: number) {
    const next = value.categoriaIds.includes(categoryId)
      ? value.categoriaIds.filter((id) => id !== categoryId)
      : [...value.categoriaIds, categoryId];

    handleChange('categoriaIds', next);
  }

  const selectedCategoryNames = categories
    .filter((category) => value.categoriaIds.includes(category.id))
    .map((category) => category.name);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="user-name" className="text-body-sm text-muted-foreground">
          Nome *
        </Label>
        <Input
          id="user-name"
          autoFocus
          required
          value={value.name}
          onChange={(event) => handleChange('name', event.target.value)}
          aria-invalid={Boolean(errors.name)}
          disabled={disabled}
          className="h-10"
          placeholder="Nome completo"
        />
        {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="user-email" className="text-body-sm text-muted-foreground">
          Email *
        </Label>
        <Input
          id="user-email"
          type="email"
          required
          value={value.email}
          onChange={(event) => handleChange('email', event.target.value)}
          aria-invalid={Boolean(errors.email)}
          disabled={disabled}
          className="h-10"
          placeholder="nome@empresa.com"
        />
        {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="user-password" className="text-body-sm text-muted-foreground">
          {isEditing ? 'Nova senha' : 'Senha *'}
        </Label>
        <Input
          id="user-password"
          type="password"
          required={!isEditing}
          autoComplete="new-password"
          value={value.password}
          onChange={(event) => handleChange('password', event.target.value)}
          aria-invalid={Boolean(errors.password)}
          disabled={disabled}
          className="h-10"
          placeholder={isEditing ? 'Deixe em branco para manter a atual' : 'Senha de acesso'}
        />
        {errors.password ? (
          <p className="text-xs text-destructive">{errors.password}</p>
        ) : isEditing ? (
          <p className="text-xs text-muted-foreground">
            Deixe em branco para manter a senha atual.
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="user-role" className="text-body-sm text-muted-foreground">
          Perfil *
        </Label>
        <Select
          value={value.role}
          onValueChange={(role) => handleChange('role', role as UserRole)}
          disabled={disabled}
        >
          <SelectTrigger
            id="user-role"
            aria-invalid={Boolean(errors.role)}
            className="h-10 w-full"
          >
            <SelectValue placeholder="Selecione um perfil" />
          </SelectTrigger>
          <SelectContent>
            {ROLE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.role && <p className="text-xs text-destructive">{errors.role}</p>}
      </div>

      <div className="flex flex-col gap-1.5 md:col-span-2">
        <Label className="text-body-sm text-muted-foreground">Categorias</Label>

        <DropdownMenu>
          <DropdownMenuTrigger
            disabled={disabled || categories.length === 0}
            className={cn(
              'flex h-10 w-full items-center justify-between gap-2 rounded-lg border border-input bg-transparent px-3 text-left text-sm outline-none',
              'disabled:cursor-not-allowed disabled:opacity-50',
            )}
          >
            <span className="truncate">
              {selectedCategoryNames.length > 0
                ? selectedCategoryNames.join(', ')
                : 'Nenhuma categoria selecionada'}
            </span>
            <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
          </DropdownMenuTrigger>

          <DropdownMenuContent align="start" className="w-(--anchor-width) min-w-56">
            {categories.map((category) => (
              <DropdownMenuCheckboxItem
                key={category.id}
                checked={value.categoriaIds.includes(category.id)}
                onCheckedChange={() => toggleCategory(category.id)}
              >
                {category.name}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <p className="text-xs text-muted-foreground">
          Administradores acessam todas as categorias, independentemente desta seleção.
        </p>
      </div>
    </div>
  );
}
