# DDL Scripts

## Files

```
postgresql/
├── snautoparts_schema.sql    # Create all tables
└── snautoparts_baseload.sql  # Load base data

sqlserver/
├── snautoparts_schema.sql    # Create all tables
└── snautoparts_baseload.sql  # Load base data
```

## Usage

### PostgreSQL
```bash
psql -d snautoparts -f postgresql/snautoparts_schema.sql
psql -d snautoparts -f postgresql/snautoparts_baseload.sql
```

### SQL Server
```bash
sqlcmd -S localhost -d snautoparts -i sqlserver/snautoparts_schema.sql
sqlcmd -S localhost -d snautoparts -i sqlserver/snautoparts_baseload.sql
```

## Data Summary

| Entity | Count |
|--------|-------|
| Tables | 27 |
| Roles | 3 |
| Role Configs | 3 |
| Brands | 8 |
| Categories | 15 |
| Products | 29 |
| Fitments | 29 |
| Features | 36 |
| Settings | 16 |

## Notes

- **Schema**: Creates tables with constraints and indexes. Idempotent (DROP IF EXISTS).
- **Baseload**: Non-transactional config/seed data. Uses UPSERT semantics.
- Both databases contain identical data.
- Alternative: Use MikroORM seeders (`npx mikro-orm seeder:run`).
