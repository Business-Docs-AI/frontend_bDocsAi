import {
  Box,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  TextField,
} from '@mui/material';

export interface UserFormData {
  name: string;
  email: string;
  permissionId: number | '';
  categoryIds: number[];
}

export interface UserFormErrors {
  name?: string;
  email?: string;
  permissionId?: string;
  categoryIds?: string;
}

interface UserFormProps {
  value: UserFormData;
  errors: UserFormErrors;
  onChange: (data: UserFormData) => void;
  onFieldChange?: (field: keyof UserFormData) => void;
}

// Dados temporários.
// Posteriormente podemos buscar essas informações do backend.
const permissions = [
  {
    id: 1,
    label: 'Administrator',
  },
  {
    id: 2,
    label: 'Editor',
  },
  {
    id: 3,
    label: 'User',
  },
];

const categories = [
  {
    id: 1,
    name: 'Development',
  },
  {
    id: 2,
    name: 'Operations',
  },
  {
    id: 3,
    name: 'Finance',
  },
];

const UserForm = ({
  value,
  errors,
  onChange,
  onFieldChange,
}: UserFormProps) => {
  const handleChange = (
    field: keyof UserFormData,
    fieldValue: string | number | number[],
  ) => {
    onChange({
      ...value,
      [field]: fieldValue,
    });

    // Limpa o erro do campo quando o usuário altera seu valor.
    onFieldChange?.(field);
  };

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          md: '1fr 1fr',
        },
        gap: 2,
        mt: 1,
      }}
    >
      {/* Name */}
      <TextField
        required
        fullWidth
        label="Name"
        placeholder="Enter the user's name"
        value={value.name}
        error={Boolean(errors.name)}
        helperText={errors.name}
        onChange={(event) =>
          handleChange('name', event.target.value)
        }
      />

      {/* Email */}
      <TextField
        required
        fullWidth
        type="email"
        label="Email"
        placeholder="Enter the user's email"
        value={value.email}
        error={Boolean(errors.email)}
        helperText={errors.email}
        onChange={(event) =>
          handleChange('email', event.target.value)
        }
      />

      {/* Role */}
      <FormControl
        fullWidth
        required
        error={Boolean(errors.permissionId)}
      >
        <InputLabel id="permission-label">
          Role
        </InputLabel>

        <Select
          labelId="permission-label"
          label="Role"
          value={value.permissionId}
          onChange={(event) =>
            handleChange(
              'permissionId',
              Number(event.target.value),
            )
          }
        >
          {permissions.map((permission) => (
            <MenuItem
              key={permission.id}
              value={permission.id}
            >
              {permission.label}
            </MenuItem>
          ))}
        </Select>

        <FormHelperText>
          {errors.permissionId}
        </FormHelperText>
      </FormControl>

      {/* Categories */}
      <FormControl
        fullWidth
        required
        error={Boolean(errors.categoryIds)}
      >
        <InputLabel id="categories-label">
          Categories
        </InputLabel>

        <Select
          multiple
          labelId="categories-label"
          value={value.categoryIds}
          input={<OutlinedInput label="Categories" />}
          onChange={(event) => {
            const selectedValue = event.target.value;

            handleChange(
              'categoryIds',
              typeof selectedValue === 'string'
                ? selectedValue.split(',').map(Number)
                : selectedValue,
            );
          }}
        >
          {categories.map((category) => (
            <MenuItem
              key={category.id}
              value={category.id}
            >
              {category.name}
            </MenuItem>
          ))}
        </Select>

        <FormHelperText>
          {errors.categoryIds}
        </FormHelperText>
      </FormControl>
    </Box>
  );
};

export default UserForm;