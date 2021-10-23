HASH := `git rev-parse --short HEAD`

SERVICE := svelte-website
PROJECT := svelte-dev

IMAGE := gcr.io/$(PROJECT)/$(SERVICE):$(HASH)

sveltekit:
	@echo "\n~> updating template & contributors list"
	@npm run update
	@echo "\n~> building SvelteKit app"
	@npm run build


docker:
	@echo "\n~> building docker image"
	@gcloud builds submit --project $(PROJECT) -t $(IMAGE)


deploy: sveltekit docker
	@echo "\n~> deploying $(SERVICE) to Cloud Run servers"
	@gcloud run deploy $(SERVICE) --project $(PROJECT) --allow-unauthenticated --platform managed --region us-central1 --image $(IMAGE) --memory=512Mi
