from setuptools import setup, find_packages

setup(
    name="github-cleaner",
    version="0.1.0",
    packages=find_packages(),
    install_requires=[
        "fastapi==0.104.1",
        "uvicorn==0.24.0",
        "PyGithub==2.1.1",
        "python-dotenv==1.0.0",
        "pydantic==2.5.2",
        "pydantic-settings==2.1.0",
        "httpx==0.25.2",
        "python-jose==3.3.0",
    ],
) 