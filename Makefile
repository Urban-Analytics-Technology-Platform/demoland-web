fe-deps:
	cd web && npm install

fe:
	cd web && npm run dev

be-deps:
	cd demoland_engine && python3 -m venv venv/api && source venv/api/bin/activate && python -m pip install .[api]

be:
	cd demoland_engine && source venv/api/bin/activate && uvicorn --app-dir api main:app --port 5174

local:
	sh -c "make be & make fe"

docker:
	docker-compose up --build
