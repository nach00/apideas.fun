#!/bin/bash

echo "Starting Heroku release phase..."

# Fix DATABASE_URL for Prisma (postgres:// -> postgresql://)
if [[ "$DATABASE_URL" == postgres://* ]]; then
  export DATABASE_URL=$(echo $DATABASE_URL | sed 's/postgres:/postgresql:/')
  echo "Updated DATABASE_URL for Prisma compatibility"
fi

# Set DATABASE_PROVIDER based on DATABASE_URL
if [[ "$DATABASE_URL" == postgresql://* ]] || [[ "$DATABASE_URL" == postgres://* ]]; then
  export DATABASE_PROVIDER="postgresql"
  echo "Using PostgreSQL database provider"
elif [[ "$DATABASE_URL" == mysql://* ]]; then
  export DATABASE_PROVIDER="mysql"
  echo "Using MySQL database provider"
else
  export DATABASE_PROVIDER="sqlite"
  echo "Using SQLite database provider"
fi

# Run prisma db push using production schema
echo "Running prisma db push with PostgreSQL schema..."
npx prisma db push --schema=prisma/schema.prisma --skip-generate

if [ $? -eq 0 ]; then
  echo "Database push completed successfully"
else
  echo "Database push failed"
  exit 1
fi

# Only run seed in non-production or if SEED_DATABASE is set
if [ "$NODE_ENV" != "production" ] || [ "$SEED_DATABASE" == "true" ]; then
  echo "Running database seed..."
  npx prisma db seed --schema=prisma/schema.prisma
  if [ $? -eq 0 ]; then
    echo "Database seed completed successfully"
  else
    echo "Database seed failed (non-fatal)"
  fi
else
  echo "Skipping database seed in production"
fi

echo "Release phase completed successfully"