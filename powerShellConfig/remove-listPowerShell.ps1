param (   
    [string]$username = $(throw "-username is required."),
    [string]$siteUrl = $(throw "-siteUrl is required.")
)

$cred = Get-Credential -UserName $username -Message "Enter SPO credentials for $userName : "

Connect-PnPOnline -Url $siteUrl -Credentials $cred

Remove-PnPList -Identity Lists/News

Write-Host "Complete" -ForegroundColor Green
