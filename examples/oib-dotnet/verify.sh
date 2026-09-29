#!/usr/bin/env sh
set -eu

for project in vezba-*/*.csproj; do
  dotnet build "$project" --nologo
done

