fe-deps:
	cd web && npm install

fe:
	cd web && npm run dev

be-deps:
	cd engine && python3 -m venv venv/api && source venv/api/bin/activate && python -m pip install .[api]

be:
	cd engine && source venv/api/bin/activate && uvicorn --app-dir api main:app --port 5174

local:
	sh -c "trap 'kill 0' SIGINT; make fe & make be"

docker:
	docker-compose up --build
