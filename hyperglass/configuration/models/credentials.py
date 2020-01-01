"""Validate credential configuration variables."""

# Third Party Imports
from pydantic import SecretStr

# Project Imports
from hyperglass.configuration.models._utils import HyperglassModel
from hyperglass.configuration.models._utils import clean_name


class Credential(HyperglassModel):
    """Model for per-credential config in devices.yaml."""

    username: str
    password: SecretStr


class Credentials(HyperglassModel):
    """Base model for credentials class."""

    @classmethod
    def import_params(cls, input_params):
        """Import credentials with corrected field names.

        Arguments:
            input_params {dict} -- Credential definition

        Returns:
            {object} -- Validated credential object
        """
        obj = Credentials()
        for (credname, params) in input_params.items():
            cred = clean_name(credname)
            setattr(Credentials, cred, Credential(**params))
        return obj
